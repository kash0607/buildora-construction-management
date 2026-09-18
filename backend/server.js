import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('🚀 Starting BUILDORA API Server...');
  
  // Attempt MongoDB connection
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn('⚠️ [Database] Running without active MongoDB connection. Live database queries will fail until MongoDB is available.');
  }

  const server = app.listen(PORT, () => {
    console.log(`✅ [Server] BUILDORA API listening on port ${PORT}`);
    console.log(`🔗 [Health] Health check: http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Keep server alive in dev or close gracefully
  });
}

startServer();
