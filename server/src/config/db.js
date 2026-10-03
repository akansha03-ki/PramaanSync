const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB.
 * CAVEAT: If MONGO_URI is provided, connects to standard MongoDB.
 * If MONGO_URI is omitted or fails, falls back to MongoMemoryServer for zero-config demoing.
 * NOTE: MongoMemoryServer does NOT persist data between application restarts.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log(`[Database] Connected to external MongoDB: ${uri}`);
      return;
    } catch (err) {
      console.warn(`[Database] Failed to connect to MONGO_URI (${err.message}). Falling back to MongoMemoryServer...`);
    }
  }

  // Fallback to in-memory MongoDB server
  console.log('[Database] Initializing MongoMemoryServer fallback for zero-config demoing...');
  console.log('[Database] CAVEAT: In-memory database does NOT persist data between application restarts. Set MONGO_URI for persistent storage.');
  
  mongoMemoryServer = await MongoMemoryServer.create();
  const mongoUri = mongoMemoryServer.getUri();
  await mongoose.connect(mongoUri);
  console.log(`[Database] Connected to MongoMemoryServer at ${mongoUri}`);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
