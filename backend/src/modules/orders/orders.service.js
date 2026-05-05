const pool = require('../../config/database.config');
const { v4: uuidv4 } = require('uuid');

exports.createOrder = async (orderData) => {
    const { customerPhone, items, totalPrice, address } = orderData;
    const query = `
        INSERT INTO orders (id, "customerPhone", items, "totalPrice", address) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    
    const values = [uuidv4(), customerPhone, JSON.stringify(items), totalPrice, address];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

exports.approveOrder = async (orderId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction for safety
        
        const { rows: orderRows } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
        if (!orderRows.length) throw new Error("Order not found");
        
        const order = orderRows[0];
        if (order.status !== 'pending') throw new Error("Order already processed");

        for (let item of order.items) {
            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`, 
                [item.quantity || 1, item.id]
            );
        }

        await client.query(`UPDATE orders SET status = 'approved' WHERE id = $1`, [order.id]);
        await client.query('COMMIT');
        
        return { success: true, message: "Inventory updated and order approved" };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.rejectOrder = async (orderId) => {
    const query = `UPDATE orders SET status = 'rejected' WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [orderId]);
    if (!rows.length) throw new Error("Order not found");
    return rows[0];
};

exports.getAdminStats = async () => {
    const query = `
        SELECT item->>'category' AS _id, SUM((item->>'price')::numeric) as "totalSales"
        FROM orders, jsonb_array_elements(items) AS item
        WHERE status = 'approved'
        GROUP BY item->>'category'
    `;
    const { rows } = await pool.query(query);
    return rows;
};
