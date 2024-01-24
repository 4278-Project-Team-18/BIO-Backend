import logger from '../config/logger.config';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import type { ConnectOptions } from 'mongoose';
dotenv.config();

const connectToMongoDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    logger.info(
      '🔌 [MONGODB]: Connected to MongoDB at ' + connection.connection.host
    );
    return connection;
  } catch (error) {
    logger.error('❌ [MONGODB]: ' + error);
  }
};

export default connectToMongoDB;
