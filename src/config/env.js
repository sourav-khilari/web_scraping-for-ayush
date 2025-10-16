import dotenv from 'dotenv';
dotenv.config();

function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  PORT: parseInt(required('PORT', '8080'), 10),
  MONGO_URI: required('MONGO_URI'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CRON_GLOBAL: process.env.CRON_GLOBAL || '*/180 * * * *',
  ADMIN_TOKEN: required('ADMIN_TOKEN', 'change-me'),
  HTTP_TIMEOUT_MS: parseInt(process.env.HTTP_TIMEOUT_MS || '12000', 10),
  USER_AGENT: process.env.USER_AGENT || 'AyushInvestBot/1.0'
};
