import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((client) => {
    client.release();
    console.log('Connected to PostgreSQL successfully');
  })
  .catch((error) => console.error('Database connection error:', error.stack));

export default pool;
