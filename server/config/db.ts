import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.warn('MONGO_URI is not defined. Falling back to high-performance local JSON persistence mode.');
    isMongoConnected = false;
    return false;
  }

  try {
    mongoose.connection.on('connected', () => {
      isMongoConnected = true;
      logger.info('MongoDB database connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      isMongoConnected = false;
      logger.error('MongoDB database connection error: %O', err);
    });

    mongoose.connection.on('disconnected', () => {
      isMongoConnected = false;
      logger.warn('MongoDB database disconnected.');
    });

    // Handle process termination to gracefully close DB connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination.');
      process.exit(0);
    });

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent DNS resolution latency
    });

    isMongoConnected = true;
    return true;
  } catch (error) {
    isMongoConnected = false;
    logger.error('Failed to connect to MongoDB initially: %O. Using local JSON fallback.', error);
    return false;
  }
}

export function getIsMongoConnected(): boolean {
  return isMongoConnected;
}
