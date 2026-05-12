import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'Vinmec_Hospital_db',
});

// Test kết nối
pool.on('connect', () => {
  console.log(' Kết nối PostgreSQL thành công!');
});

pool.on('error', (err) => {
  console.error(' Lỗi kết nối PostgreSQL:', err);
});

export default pool;
