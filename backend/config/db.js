import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance using MONGODB_URI environment variable.
 * Fails safely with clear logging if URI is missing or connection fails.
 */
let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ [Database] MONGODB_URI / MONGO_URI environment variable is not defined.');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ [Database] MongoDB connection error: ${error.message}`);
    return false;
  }
}

export function getDBStatus() {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
}

export default connectDB;
