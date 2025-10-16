import mongoose from 'mongoose';
import { logger } from './logger.js';
import { env } from './env.js';

export async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  logger.info({ msg: 'mongo.connected' });
}

export function mongoHealth() {
  return mongoose.connection.readyState === 1;
}
