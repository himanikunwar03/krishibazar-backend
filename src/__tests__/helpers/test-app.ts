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
  // Disconnect from database
  await mongoose.disconnect();

  // Stop the in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
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
