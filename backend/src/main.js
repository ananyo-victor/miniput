require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const appRoutes = require('./app.route');
const initializeDatabase = require('./config/db-init.config');
const { errorHandler } = require('./common/middlewares/error.middleware');

require('./config/database.config');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" } 
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected'));
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', appRoutes);

const clientDistPath = path.join(__dirname, '../client/dist'); 
app.use(express.static(clientDistPath));

app.get(['/', '/admin', '/customer'], (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.use((err, req, res, next) => {
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: 'Payload too large. Please upload a smaller image.'
        });
    }
    return next(err);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await initializeDatabase();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize database schema:', error.message);
        process.exit(1);
    }
}

startServer();
