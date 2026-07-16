import request from 'supertest';
import { testApp, setupTestApp, teardownTestApp, clearDatabase } from '../helpers/test-app';
import User from '../../models/user.model';
import Product from '../../models/product.model';

describe('Product API Integration Tests', () => {
  let farmerToken: string;
  let farmerId: string;
  let userToken: string;
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

    farmerId = farmerResponse.body.data._id;

    // Login as farmer to get token
    const farmerLoginResponse = await request(testApp)
      .post('/api/v1/auth/login')
      .send({
        email: 'farmer@example.com',
        password: 'password123',
      });

    farmerToken = farmerLoginResponse.body.data.token;

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

    // Login as user to get token
    const userLoginResponse = await request(testApp)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      });

    userToken = userLoginResponse.body.data.token;
  });

  describe('POST /api/v1/products', () => {
    it('should create a product successfully as farmer', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        image: 'https://example.com/tomato.jpg',
        unit: 'kg',
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData)
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.farmerId).toBe(farmerId);
      productId = response.body.data._id;
    });

    it('should fail to create product without authentication', async () => {
      const productData = {
        name: 'Tomato',
        price: 50,
        stock: 100,
        category: 'Vegetables',
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .send(productData)
        .expect(401);
    });

    it('should fail to create product as regular user', async () => {
      const productData = {
        name: 'Tomato',
        price: 50,
        stock: 100,
        category: 'Vegetables',
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(403);
    });

    it('should fail to create product without required fields', async () => {
      const productData = {
        description: 'Fresh organic tomatoes',
        price: 50,
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData)
        .expect(400);
    });

    it('should fail to create product with negative price', async () => {
      const productData = {
        name: 'Tomato',
        price: -50,
        stock: 100,
        category: 'Vegetables',
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData)
        .expect(400);
    });

    it('should fail to create product with invalid category', async () => {
      const productData = {
        name: 'Tomato',
        price: 50,
        stock: 100,
        category: 'InvalidCategory',
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData)
        .expect(400);
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        {
          name: 'Tomato',
          description: 'Fresh organic tomatoes',
          price: 50,
          stock: 100,
          category: 'Vegetables',
          farmerId,
        },
        {
          name: 'Apple',
          description: 'Fresh testApples',
          price: 80,
          stock: 50,
          category: 'Fruits',
          farmerId,
        },
      ];

      for (const product of products) {
        await request(testApp)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send(product);
      }
    });

    it('should get all products without authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('meta');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(testApp)
        .get('/api/v1/products?page=1&limit=1')
        .expect(200);

      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.meta.limit).toBe(1);
      expect(response.body.data.meta.page).toBe(1);
    });

    it('should filter by category', async () => {
      const response = await request(testApp)
        .get('/api/v1/products?category=Vegetables')
        .expect(200);

      response.body.data.data.forEach((product: any) => {
        expect(product.category).toBe('Vegetables');
      });
    });

    it('should search products by name', async () => {
      const response = await request(testApp)
        .get('/api/v1/products?search=Tomato')
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].name).toContain('Tomato');
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(testApp)
        .get('/api/v1/products?search=NonExistent')
        .expect(200);

      expect(response.body.data.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    beforeEach(async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId,
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData);

      productId = response.body.data._id;
    });

    it('should get a single product by id', async () => {
      const response = await request(testApp)
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data._id).toBe(productId);
      expect(response.body.data.name).toBe('Tomato');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(testApp)
        .get('/api/v1/products/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(testApp)
        .get('/api/v1/products/invalid-id')
        .expect(500);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    beforeEach(async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId,
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData);

      productId = response.body.data._id;
    });

    it('should update product as farmer owner', async () => {
      const updateData = {
        name: 'Updated Tomato',
        price: 60,
      };

      const response = await request(testApp)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should fail to update product without authentication', async () => {
      const updateData = {
        name: 'Updated Tomato',
      };

      const response = await request(testApp)
        .put(`/api/v1/products/${productId}`)
        .send(updateData)
        .expect(401);
    });

    it('should fail to update product as non-owner', async () => {
      const updateData = {
        name: 'Updated Tomato',
      };

      const response = await request(testApp)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should fail to update non-existent product', async () => {
      const updateData = {
        name: 'Updated Tomato',
      };

      const response = await request(testApp)
        .put('/api/v1/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should allow partial updates', async () => {
      const updateData = {
        price: 70,
      };

      const response = await request(testApp)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.price).toBe(70);
      expect(response.body.data.name).toBe('Tomato'); // unchanged
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    beforeEach(async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId,
      };

      const response = await request(testApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(productData);

      productId = response.body.data._id;
    });

    it('should delete product as farmer owner', async () => {
      const response = await request(testApp)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      // Verify product is deleted
      await request(testApp)
        .get(`/api/v1/products/${productId}`)
        .expect(404);
    });

    it('should fail to delete product without authentication', async () => {
      const response = await request(testApp)
        .delete(`/api/v1/products/${productId}`)
        .expect(401);
    });

    it('should fail to delete product as non-owner', async () => {
      const response = await request(testApp)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should fail to delete non-existent product', async () => {
      const response = await request(testApp)
        .delete('/api/v1/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/products/farmer/:farmerId', () => {
    beforeEach(async () => {
      const products = [
        {
          name: 'Tomato',
          price: 50,
          stock: 100,
          category: 'Vegetables',
          farmerId,
        },
        {
          name: 'Apple',
          price: 80,
          stock: 50,
          category: 'Fruits',
          farmerId,
        },
      ];

      for (const product of products) {
        await request(testApp)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send(product);
      }
    });

    it('should get all products for current farmer', async () => {
      const response = await request(testApp)
        .get('/api/v1/products/farmer/my-products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBe(2);
      response.body.data.data.forEach((product: any) => {
        expect(product.farmerId).toBe(farmerId);
      });
    });

    it('should fail to get farmer products without authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/products/farmer/my-products')
        .expect(401);
    });

    it('should fail to get farmer products as non-farmer', async () => {
      const response = await request(testApp)
        .get('/api/v1/products/farmer/my-products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return empty array for farmer with no products', async () => {
      // Clear all products first
      await clearDatabase();
      
      // Recreate users
      const farmerData = {
        firstName: 'John',
        lastName: 'Farmer',
        email: 'farmer2@example.com',
        password: 'password123',
        role: 'farmer',
      };

      const farmerResponse = await request(testApp)
        .post('/api/v1/auth/register')
        .send(farmerData);

      const farmerLoginResponse = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: 'farmer2@example.com',
          password: 'password123',
        });

      const farmerToken2 = farmerLoginResponse.body.data.token;

      const response = await request(testApp)
        .get('/api/v1/products/farmer/my-products')
        .set('Authorization', `Bearer ${farmerToken2}`)
        .expect(200);

      expect(response.body.data.data).toHaveLength(0);
    });
  });
});
