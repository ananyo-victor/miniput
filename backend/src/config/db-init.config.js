const pool = require('./database.config');

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
            stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
            "imageUrl" TEXT,
            brand TEXT NOT NULL CHECK (brand IN ('Miniput', 'Kwink')),
            "isHidden" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY,
            "customerPhone" TEXT NOT NULL,
            items JSONB NOT NULL,
            "totalPrice" NUMERIC(12, 2) NOT NULL CHECK ("totalPrice" >= 0),
            address TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

module.exports = initializeDatabase;
