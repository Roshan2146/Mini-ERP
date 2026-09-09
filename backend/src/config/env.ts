import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/erp_crm_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_erp_crm_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
