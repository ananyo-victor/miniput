const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRESQL_DATABASE_URL, 
    ssl: { 
        rejectUnauthorized: false 
    }
});

pool.connect()
    .then(() => console.log("Connected to PostgreSQL successfully"))
    .catch(err => console.error("Database connection error:", err.stack));

module.exports = pool;