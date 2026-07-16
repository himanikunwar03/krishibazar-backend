import { MongoMemoryServer } from 'mongodb-memory-server';

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.SECRET_key = 'test-secret-key';
});

afterAll(async () => {
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database before each test
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
