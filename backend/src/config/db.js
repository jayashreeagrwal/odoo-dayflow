import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Configure it in backend/.env');
  }

  try {
    const maskedUri = mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@');
    console.log(`Connecting to MongoDB at: ${maskedUri}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.USE_IN_MEMORY_DB = false;
    return conn;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};
