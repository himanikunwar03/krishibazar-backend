import User from '../../models/user.model';
import { connectToMongoDB } from '../../database/mongodb';

describe('User Model', () => {
  beforeAll(async () => {
    await connectToMongoDB();
  });

  describe('User Schema Validation', () => {
    it('should create a valid user with all required fields', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        username: 'johndoe',
        role: 'user',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.role).toBe(userData.role);
    });

    it('should fail to create user without required email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user without required firstName', async () => {
      const userData = {
        email: 'test@example.com',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user without required lastName', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        password: 'password123',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user without required password', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should set default role to user when not provided', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('user');
    });

    it('should allow farmer role', async () => {
      const userData = {
        email: 'farmer@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: 'farmer',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('farmer');
    });

    it('should fail to create user with invalid role', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        role: 'admin',
      } as any;

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      await new User(userData).save();
      
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should allow optional username field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.username).toBeUndefined();
    });

    it('should allow optional profileImage field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        profileImage: 'https://example.com/image.jpg',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.profileImage).toBe('https://example.com/image.jpg');
    });

    it('should have _id field', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
    });
  });

  describe('User Instance Methods', () => {
    it('should convert user to JSON', () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json).toBeDefined();
      expect(json.email).toBe(userData.email);
    });
  });
});
