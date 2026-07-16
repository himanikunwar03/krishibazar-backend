import request from 'supertest';
import { testApp, setupTestApp, teardownTestApp, clearDatabase } from '../helpers/test-app';
import User from '../../models/user.model';
import Product from '../../models/product.model';
import Favorite from '../../models/favorite.model';

describe('Favorite API Integration Tests', () => {
  let farmerToken: string;
  let farmerId: string;
  let userToken: string;
  let userId: string;
  let productId: string;

  beforeAll(async () => {
    await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    // Create a farmer user
    const farmerData = {
      firstName: 'John',
      lastName: 'Farmer',
      email: 'farmer@example.com',
      password: 'password123',
      role: 'farmer',
    };

    const farmerResponse = await request(testApp)
      .post('/api/v1/auth/register')
      .send(farmerData);

    farmerToken = farmerResponse.body.data.token;
    farmerId = farmerResponse.body.data.user._id;

    // Create a regular user
    const userData = {
      firstName: 'Jane',
      lastName: 'User',
      email: 'user@example.com',
      password: 'password123',
    };

    const userResponse = await request(testApp)
      .post('/api/v1/auth/register')
      .send(userData);

    userToken = userResponse.body.data.token;
    userId = userResponse.body.data.user._id;

    // Create a test product
    const productData = {
      name: 'Tomato',
      description: 'Fresh organic tomatoes',
      price: 50,
      stock: 100,
      category: 'Vegetables',
    };

    const productResponse = await request(testApp)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send(productData);

    productId = productResponse.body.data._id;
  });

  describe('POST /api/v1/favorites', () => {
    it('should add product to favorites successfully', async () => {
      const response = await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId })
        .expect(201);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.productId).toBe(productId);
    });

    it('should fail to add favorite without authentication', async () => {
      const response = await request(testApp)
        .post('/api/v1/favorites')
        .send({ productId })
        .expect(401);
    });

    it('should fail to add favorite without productId', async () => {
      const response = await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });

    it('should fail to add favorite with invalid productId', async () => {
      const response = await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: '507f1f77bcf86cd799439011' })
        .expect(400);
    });

    it('should fail to add duplicate favorite', async () => {
      await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId })
        .expect(201);

      const response = await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId })
        .expect(400);
    });
  });

  describe('GET /api/v1/favorites', () => {
    beforeEach(async () => {
      // Add product to favorites
      await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId });
    });

    it('should get user favorites with authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('favorites');
      expect(Array.isArray(response.body.data.favorites)).toBe(true);
      expect(response.body.data.favorites.length).toBeGreaterThan(0);
    });

    it('should fail to get favorites without authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/favorites')
        .expect(401);
    });

    it('should return empty array for user with no favorites', async () => {
      // Create another user
      const userData2 = {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        password: 'password123',
      };

      const userResponse2 = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData2);

      const userToken2 = userResponse2.body.data.token;

      const response = await request(testApp)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(200);

      expect(response.body.data.favorites).toHaveLength(0);
    });

    it('should include product details in favorites', async () => {
      const response = await request(testApp)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.favorites[0]).toHaveProperty('product');
      expect(response.body.data.favorites[0].product).toHaveProperty('name');
      expect(response.body.data.favorites[0].product).toHaveProperty('price');
    });
  });

  describe('DELETE /api/v1/favorites/:productId', () => {
    beforeEach(async () => {
      // Add product to favorites
      await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId });
    });

    it('should remove product from favorites successfully', async () => {
      const response = await request(testApp)
        .delete(`/api/v1/favorites/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.message).toBeDefined();

      // Verify favorite is removed
      const getResponse = await request(testApp)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(getResponse.body.data.favorites).toHaveLength(0);
    });

    it('should fail to remove favorite without authentication', async () => {
      const response = await request(testApp)
        .delete(`/api/v1/favorites/${productId}`)
        .expect(401);
    });

    it('should fail to remove non-existent favorite', async () => {
      const response = await request(testApp)
        .delete('/api/v1/favorites/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should allow removing favorite that was not added by user', async () => {
      // Create another user
      const userData2 = {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        password: 'password123',
      };

      const userResponse2 = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData2);

      const userToken2 = userResponse2.body.data.token;

      const response = await request(testApp)
        .delete(`/api/v1/favorites/${productId}`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/favorites/check/:productId', () => {
    beforeEach(async () => {
      // Add product to favorites
      await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId });
    });

    it('should return true for favorited product', async () => {
      const response = await request(testApp)
        .get(`/api/v1/favorites/check/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.isFavorite).toBe(true);
    });

    it('should return false for non-favorited product', async () => {
      // Create another product
      const productData2 = {
        name: 'Apple',
        price: 80,
        stock: 50,
        category: 'Fruits',
      };

      const productResponse2 = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData2);

      const productId2 = productResponse2.body.data._id;

      const response = await request(testApp)
        .get(`/api/v1/favorites/check/${productId2}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.isFavorite).toBe(false);
    });

    it('should fail to check without authentication', async () => {
      const response = await request(testApp)
        .get(`/api/v1/favorites/check/${productId}`)
        .expect(401);
    });

    it('should return false for non-existent product', async () => {
      const response = await request(testApp)
        .get('/api/v1/favorites/check/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.isFavorite).toBe(false);
    });
  });

  describe('Multiple favorites operations', () => {
    let productId2: string;

    beforeEach(async () => {
      // Create another product
      const productData2 = {
        name: 'Apple',
        price: 80,
        stock: 50,
        category: 'Fruits',
      };

      const productResponse2 = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData2);

      productId2 = productResponse2.body.data._id;

      // Add both products to favorites
      await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId });

      await request(testApp)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: productId2 });
    });

    it('should get all user favorites', async () => {
      const response = await request(testApp)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.favorites).toHaveLength(2);
    });

    it('should remove one favorite and keep others', async () => {
      await request(testApp)
        .delete(`/api/v1/favorites/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const response = await request(testApp)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.favorites).toHaveLength(1);
      expect(response.body.data.favorites[0].productId).toBe(productId2);
    });

    it('should check multiple products for favorite status', async () => {
      const response1 = await request(testApp)
        .get(`/api/v1/favorites/check/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const response2 = await request(testApp)
        .get(`/api/v1/favorites/check/${productId2}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response1.body.isFavorite).toBe(true);
      expect(response2.body.isFavorite).toBe(true);
    });
  });
});
