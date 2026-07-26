import app from '../../app';
import { connectToMongoDB } from '../../database/mongodb';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export async function setupTestApp() {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set environment variable for database connection
  process.env.MONGODB_URI = mongoUri;

  // Connect to the test database
  await connectToMongoDB();

  return app;
}

export async function teardownTestApp() {
  // Disconnect from database with timeout
  try {
    await Promise.race([
      mongoose.disconnect(),
      new Promise((resolve) => setTimeout(resolve, 5000))
    ]);
  } catch (err) {
    // Ignore disconnect errors
  }

  // Force close all connections
  try {
    if (mongoose.connection.readyState !== 0) {
      await Promise.race([
        mongoose.connection.close(),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);
    }
  } catch (err) {
    // Ignore close errors
  }

  // Stop the in-memory MongoDB server
  if (mongoServer) {
    try {
      await Promise.race([
        mongoServer.stop(),
        new Promise((resolve) => setTimeout(resolve, 5000))
      ]);
    } catch (err) {
      // Ignore stop errors
    }
  }
}

export async function clearDatabase() {
  // Clear all collections
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// Export the app directly for use in tests
export { app as testApp };
