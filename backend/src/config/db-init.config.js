const pool = require('./database.config');
const { v4: uuidv4 } = require('uuid');

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
            description TEXT NOT NULL DEFAULT '',
            "isHidden" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
            id UUID PRIMARY KEY,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            size TEXT NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
            price NUMERIC(12, 2),
            sku TEXT,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (product_id, size)
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

    // Backfill one default variant for existing products that have none yet.
    const { rows: products } = await pool.query(`SELECT id, stock FROM products`);
    for (const product of products) {
        await pool.query(
            `
            INSERT INTO product_variants (id, product_id, size, stock)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (product_id, size) DO NOTHING
            `,
            [uuidv4(), product.id, 'default', Math.max(0, Number(product.stock) || 0)]
        );
    }

    // Keep products.stock aligned with summed variant stock for compatibility.
    await pool.query(`
        UPDATE products p
        SET stock = COALESCE((
            SELECT SUM(v.stock)
            FROM product_variants v
            WHERE v.product_id = p.id
        ), 0)
    `);
}

module.exports = initializeDatabase;
