import { Pool } from 'pg';
import 'dotenv/config';

const isSupabase = process.env.DB_PROVIDER === 'SUPABASE';

const pool = isSupabase
  ? new Pool({
      connectionString: process.env.POSTGRESQL_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

pool
  .connect()
  .then((client) => {
    client.release();
    console.log(`Connected to PostgreSQL via ${isSupabase ? 'Supabase' : 'EC2'} successfully`);
  })
  .catch((error) => console.error('Database connection error:', error.stack));

export default pool;
