const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Adjust for production
});
const otpStore = new Map();
const OTP_EXPIRY_MS = Number(process.env.OTP_EXPIRY_MS || 5 * 60 * 1000);

function normalizePhone(phone = "") {
    return phone.toString().replace(/\D/g, "");
}

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function upsertOtp(channel, recipient) {
    const code = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;
    otpStore.set(`${channel}:${recipient}`, { code, expiresAt });
    return { code, expiresAt };
}

function verifyOtp(channel, recipient, otp) {
    const key = `${channel}:${recipient}`;
    const data = otpStore.get(key);

    if (!data) {
        return { ok: false, message: "OTP not found. Please request a new OTP." };
    }
    if (Date.now() > data.expiresAt) {
        otpStore.delete(key);
        return { ok: false, message: "OTP expired. Please request a new OTP." };
    }
    if (String(otp) !== data.code) {
        return { ok: false, message: "Invalid OTP." };
    }

    otpStore.delete(key);
    return { ok: true };
}

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- CLOUDINARY CONFIG ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// --- MONGODB ATLAS CONNECTION ---
mongoose.connect(process.env.ATLAS_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

// --- SCHEMAS & MODELS ---
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    stock: Number,
    imageUrl: String,
    brand: { type: String, enum: ['Miniput', 'Kwink'] },
    isHidden: { type: Boolean, default: false }
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    customerPhone: String,
    items: Array,
    totalPrice: Number,
    address: String,
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

const userSchema = new mongoose.Schema({
    phone: { type: String, unique: true },
    email: String,
    address: String, // Store address here so it's "saved" for next time
    isNewUser: { type: Boolean, default: true }
});
const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// 0. Upload Product Image (Admin -> Cloudinary)
app.post('/api/uploads/product-image', async (req, res) => {
    try {
        const { imageData } = req.body;
        if (!imageData) {
            return res.status(400).json({ message: 'imageData is required' });
        }

        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'products'
        });

        res.status(201).json({
            success: true,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1. Fetch Products (For Customer & Admin)
app.get('/api/products', async (req, res) => {
    const includeHidden = req.query.includeHidden === 'true';
    const query = includeHidden ? {} : { isHidden: { $ne: true } };
    const products = await Product.find(query);
    res.json(products);
});

// 1.1 Create Product (Admin Side)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Submit Order (Customer Side)
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        io.emit('new-order-received', newOrder);

        // NEW: Automatically notify the seller on WhatsApp
        await sendSellerApprovalButton(newOrder._id, newOrder.customerPhone, newOrder.totalPrice);

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Approve Order (Admin Side)
app.patch('/api/orders/:id/approve', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order.status !== 'pending') return res.status(400).send("Order already processed");

        // Logic: Reduce stock for each item in the order
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item._id, {
                $inc: { stock: -item.quantity || -1 } // Reduces stock by ordered qty
            });
        }

        order.status = 'approved';
        await order.save();

        res.json({ success: true, message: "Inventory updated and order approved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Sales Stats (Admin Dashboard Graph)
app.get('/api/admin/stats', async (req, res) => {
    const stats = await Order.aggregate([
        { $match: { status: 'approved' } },
        { $unwind: "$items" },
        { $group: { _id: "$items.category", totalSales: { $sum: "$items.price" } } }
    ]);
    res.json(stats);
});

// 1. Customer: Check Phone / Send OTP
app.post('/api/auth/customer/check', async (req, res) => {
    try {
        const { phone } = req.body;
        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) {
            return res.status(400).json({ success: false, message: "Phone is required" });
        }

        const user = await User.findOne({ phone: normalizedPhone });
        const { code, expiresAt } = upsertOtp("customer", normalizedPhone);

        if (process.env.WA_PHONE_NUMBER_ID && process.env.WA_ACCESS_TOKEN) {
            await sendOtpMessage(normalizedPhone, code);
        } else {
            console.log(`[OTP] customer ${normalizedPhone}: ${code}`);
        }

        res.json({ success: true, exists: !!user, message: "OTP sent", expiresAt });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
    }
});

// 2. Customer: Verify & Update Email
app.post('/api/auth/customer/verify', async (req, res) => {
    try {
        const { phone, email, otp } = req.body;
        const normalizedPhone = normalizePhone(phone);
        const otpResult = verifyOtp("customer", normalizedPhone, otp);

        if (!otpResult.ok) {
            return res.status(401).json({ success: false, message: otpResult.message });
        }

        let user = await User.findOne({ phone: normalizedPhone });
        if (!user) {
            user = new User({ phone: normalizedPhone, email, isNewUser: false });
        } else {
            user.email = email || user.email;
            user.isNewUser = false;
        }

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to verify OTP", error: error.message });
    }
});

// 3. Admin: 2-Step Login
app.post('/api/auth/admin/step1', async (req, res) => {
    try {
        const { userId, password } = req.body;
        if (userId === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
            const adminPhone = normalizePhone(process.env.ADMIN_PHONE || "");
            if (!adminPhone) {
                return res.status(500).json({ success: false, message: "ADMIN_PHONE is not configured" });
            }

            const { code, expiresAt } = upsertOtp("admin", adminPhone);

            if (process.env.WA_PHONE_NUMBER_ID && process.env.WA_ACCESS_TOKEN) {
                console.log(`Sending OTP to admin ${adminPhone} via WhatsApp`);
                await sendOtpMessage(adminPhone, code);
                console.log("WhatsApp OTP request accepted");
            } else {
                console.log(`[OTP] admin ${adminPhone}: ${code}`);
            }

            return res.json({ success: true, nextStep: "OTP_REQUIRED", expiresAt });
        }
        res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to process admin login", error: error.message });
    }
});

app.post('/api/auth/admin/verify', async (req, res) => {
    const adminPhone = normalizePhone(process.env.ADMIN_PHONE || "");
    const { otp } = req.body;
    const otpResult = verifyOtp("admin", adminPhone, otp);

    if (!otpResult.ok) {
        return res.status(401).json({ success: false, message: otpResult.message });
    }

    return res.json({ success: true, message: "Admin authenticated" });
});

// --- ADDED REJECT ROUTE ---

app.patch('/api/orders/:id/reject', async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ success: true, message: "Order Rejected. No stock changed." });
});

// --- ADDED INVENTORY EDIT (For Admin Dashboard) ---
app.put('/api/products/:id', async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
});

// --- HIDE/UNHIDE PRODUCT (Soft Toggle) ---
app.patch('/api/products/:id/visibility', async (req, res) => {
    try {
        const { isHidden } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { isHidden: !!isHidden },
            { new: true }
        );
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- DELETE PRODUCT (Hard Delete) ---
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));
app.get(['/', '/admin', '/customer'], (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// --- SOCKET CONNECTION ---
io.on('connection', (socket) => {
    console.log('Admin or Customer connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected'));
});

// --- WHATSAPP WEBHOOK VERIFICATION ---
app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === process.env.VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/api/whatsapp/webhook', async (req, res) => {
    const status = req.body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    if (status) {
        console.log(`[WA STATUS] id=${status.id} status=${status.status} recipient=${status.recipient_id}`);
        if (status.errors?.length) {
            console.log("[WA STATUS ERROR]", status.errors);
        }
        return res.sendStatus(200);
    }

    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = normalizePhone(message.from);
    const isAdmin = from === normalizePhone(process.env.ADMIN_PHONE || "");

    // 1. Forward Customer Payment Screenshots to Seller
    if (!isAdmin && message.type === 'image') {
        const imageId = message.image.id;
        // Forward this image ID to the Seller so they can verify payment
        await sendWhatsAppText(process.env.ADMIN_PHONE, `Customer ${from} sent a payment proof! (ID: ${imageId})`);
    }

    // 2. Handle Seller Confirmation (The "Middleware" logic)
    if (isAdmin && message.type === 'interactive') {
        const payload = message.interactive.button_reply?.id;
        if (payload?.startsWith('CONFIRM_ORDER_')) {
            const orderId = payload.split('_')[2];
            const order = await Order.findById(orderId); // Find the order to get customer phone

            const result = await internalApproveOrder(orderId);
            if (result.success && order) {
                // Send confirmation to the CUSTOMER, not the seller
                await sendWhatsAppText(order.customerPhone, "Payment verified! Your order is confirmed. 📦");
                // Notify seller it's done
                await sendWhatsAppText(process.env.ADMIN_PHONE, "Inventory updated and customer notified. ✅");
            }
        }
    }
    res.sendStatus(200);
});

// --- HELPER FUNCTIONS FOR WHATSAPP API ---

async function sendWhatsAppText(to, text) {
    try {
        await axios.post(`https://graph.facebook.com/v25.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
            messaging_product: "whatsapp",
            to: normalizePhone(to),
            type: "text",
            text: { body: text }
        }, { headers: { 'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}` } });
        console.log("Message sent successfully!");
    } catch (error) {
        console.error("WhatsApp API Error:", error.response?.data || error.message);
    }
}

async function sendWhatsAppImage(to, url, caption) {
    await axios.post(`https://graph.facebook.com/v25.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: normalizePhone(to),
        type: "image",
        image: { link: url, caption: caption }
    }, { headers: { 'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}` } });
}

async function sendWhatsAppTemplate(to, templateName, languageCode, bodyValues = []) {
    const components = bodyValues.length
        ? [{
            type: "body",
            parameters: bodyValues.map(value => ({ type: "text", text: String(value) }))
        }]
        : [];

    await axios.post(`https://graph.facebook.com/v25.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: normalizePhone(to),
        type: "template",
        template: {
            name: templateName,
            language: { code: languageCode },
            components
        }
    }, { headers: { 'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}` } });
}

async function sendOtpMessage(phone, code) {
    const templateName = process.env.WA_OTP_TEMPLATE_NAME;
    const templateLang = process.env.WA_OTP_TEMPLATE_LANG || "en_US";
    const expiryMins = Math.ceil(OTP_EXPIRY_MS / 60000);
    const paramCount = Number(process.env.WA_OTP_TEMPLATE_PARAM_COUNT || 1);

    if (templateName) {
        const templateParams = paramCount >= 2 ? [code, expiryMins] : [code];
        await sendWhatsAppTemplate(phone, templateName, templateLang, templateParams);
        return;
    }

    // Fallback for development only. In production, OTP should be sent via templates.
    await sendWhatsAppText(phone, `Your OTP is ${code}. It expires in ${expiryMins} minutes.`);
}

// Reuse your existing logic but make it a function
async function internalApproveOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'pending') return { success: false };

    for (let item of order.items) {
        await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
    }
    order.status = 'approved';
    await order.save();
    return { success: true };
}

async function sendSellerApprovalButton(orderId, customerPhone, total) {
    await axios.post(`https://graph.facebook.com/v25.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: normalizePhone(process.env.ADMIN_PHONE), // Add your phone number to .env
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: `New Order from ${customerPhone}\nTotal: ₹${total}\nVerify payment screenshot and click below:` },
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: { id: `CONFIRM_ORDER_${orderId}`, title: "Confirm Order" }
                    }
                ]
            }
        }
    }, { headers: { 'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}` } });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
