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
    console.log(
      '🔌 [MONGODB]: Connected to MongoDB at ' + connection.connection.host
    );
    return connection;
  } catch (error) {
    console.log('❌ [MONGODB]: ' + error);
  }
};

export default connectToMongoDB;
