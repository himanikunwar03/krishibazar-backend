import request from 'supertest';
import { testApp, setupTestApp, teardownTestApp, clearDatabase } from '../helpers/test-app';
import User from '../../models/user.model';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../configs/constant';

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
  });
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        username: 'johndoe',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.firstName).toBe(userData.firstName);
    });

    it('should fail to register with missing required fields', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to register with invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should fail to register with short password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should fail to register with duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(200);

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should register a farmer with farmer role', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'farmer',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body.data.role).toBe('farmer');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(loginData.email);
    });

    it('should fail login with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);
    });

    it('should fail login with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);
    });

    it('should fail login with missing email', async () => {
      const loginData = {
        password: 'password123',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);
    });

    it('should fail login with missing password', async () => {
      const loginData = {
        email: 'john@example.com',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/whoami', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData);

      const loginResponse = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      if (loginResponse.status !== 200) {
        console.error('Login failed with status:', loginResponse.status);
        console.error('Response body:', loginResponse.body);
      }

      authToken = loginResponse.body.data?.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(testApp)
        .get('/api/v1/auth/whoami')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
    });

    it('should fail to get profile without token', async () => {
      const response = await request(testApp)
        .get('/api/v1/auth/whoami')
        .expect(401);
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(testApp)
        .get('/api/v1/auth/whoami')
        .set('Authorization', 'Bearer invalid-token')
        .expect(500);
    });

    it('should fail to get profile with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' },
        SECRET_KEY,
        { expiresIn: '-1h' }
      );

      const response = await request(testApp)
        .get('/api/v1/auth/whoami')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(500);
    });
  });

  describe('PUT /api/v1/auth/update', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData);

      const loginResponse = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      if (loginResponse.status !== 200) {
        console.error('Login failed with status:', loginResponse.status);
        console.error('Response body:', loginResponse.body);
      }

      authToken = loginResponse.body.data?.token;
      userId = loginResponse.body.data?._id;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
    });

    it('should update user password', async () => {
      const updateData = {
        password: 'newpassword123',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Try logging in with new password
      const loginResponse = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body.data).toHaveProperty('token');
    });

    it('should fail to update without token', async () => {
      const updateData = {
        firstName: 'Jane',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .send(updateData)
        .expect(401);
    });

    it('should fail to update with invalid token', async () => {
      const updateData = {
        firstName: 'Jane',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .set('Authorization', 'Bearer.Invalid.Token')
        .send(updateData)
        .expect(401);
    });

    it('should allow partial updates', async () => {
      const updateData = {
        firstName: 'Jane',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.firstName).toBe('Jane');
      expect(response.body.data.lastName).toBe('Doe'); // unchanged
    });

    it('should reject invalid email format', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should reject short password', async () => {
      const updateData = {
        password: '123',
      };

      const response = await request(testApp)
        .put('/api/v1/auth/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });
});
