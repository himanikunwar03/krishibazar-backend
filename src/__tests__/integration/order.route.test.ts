import request from 'supertest';
import { testApp, setupTestApp, teardownTestApp, clearDatabase } from '../helpers/test-app';
import User from '../../models/user.model';
import Product from '../../models/product.model';
import Order from '../../models/order.model';

describe('Order API Integration Tests', () => {
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
    await clearDatabase();
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

    if (farmerResponse.status !== 200) {
      console.error('Farmer registration failed:', farmerResponse.status, farmerResponse.body);
    }
    farmerId = farmerResponse.body.data._id;

    // Login as farmer to get token
    const farmerLoginResponse = await request(testApp)
      .post('/api/v1/auth/login')
      .send({
        email: 'farmer@example.com',
        password: 'password123',
      });

    if (farmerLoginResponse.status !== 200) {
      console.error('Farmer login failed:', farmerLoginResponse.status, farmerLoginResponse.body);
    }
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

    if (userResponse.status !== 200) {
      console.error('User registration failed:', userResponse.status, userResponse.body);
    }
    userId = userResponse.body.data._id;

    // Login as user to get token
    const userLoginResponse = await request(testApp)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      });

    if (userLoginResponse.status !== 200) {
      console.error('User login failed:', userLoginResponse.status, userLoginResponse.body);
    }
    userToken = userLoginResponse.body.data.token;

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

    if (productResponse.status !== 200) {
      console.error('Product creation failed:', productResponse.status, productResponse.body);
    }
    productId = productResponse.body.data._id;
  });

  describe('POST /api/v1/orders', () => {
    it('should create an order successfully', async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod',
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.totalAmount).toBe(100);
      expect(response.body.data.status).toBe('pending');
    });

    it('should fail to create order without authentication', async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(401);
    });

    it('should fail to create order without items', async () => {
      const orderData = {
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(400);
    });

    it('should fail to create order without shippingAddress', async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(400);
    });

    it('should fail to create order with invalid product', async () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439011',
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(404);
    });

    it('should fail to create order with zero quantity', async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 0,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(400);
    });

    it('should create order with multiple items', async () => {
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

      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
          {
            productId: productId2,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.totalAmount).toBe(180);
    });

    it('should accept esewa payment method', async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'esewa',
        paymentToken: 'test-token',
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.data.paymentMethod).toBe('esewa');
    });
  });

  describe('GET /api/v1/orders', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      orderId = response.body.data._id;
    });

    it('should get user orders with authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('orders');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('should fail to get orders without authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/orders/my-orders')
        .expect(401);
    });

    it('should return only user own orders', async () => {
      // Create another user and order
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

      const orderData = {
        items: [
          {
            productId,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '456 Oak St',
          city: 'Pokhara',
          state: 'Gandaki',
          zipCode: '33700',
          phone: '9800000001',
        },
      };

      await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken2}`)
        .send(orderData);

      // Get orders for first user
      const response = await request(testApp)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      response.body.data.orders.forEach((order: any) => {
        expect(order.userId).toBe(userId);
      });
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      orderId = response.body.data._id;
    });

    it('should get order by id as order owner', async () => {
      const response = await request(testApp)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data._id).toBe(orderId);
      expect(response.body.data.userId).toBe(userId);
    });

    it('should fail to get order without authentication', async () => {
      const response = await request(testApp)
        .get(`/api/v1/orders/${orderId}`)
        .expect(401);
    });

    it('should fail to get order as non-owner', async () => {
      const userData2 = {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        password: 'password123',
      };

      await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData2);

      const loginResponse2 = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: 'bob@example.com',
          password: 'password123',
        });

      const userToken2 = loginResponse2.body.data.token;

      const response = await request(testApp)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(testApp)
        .get('/api/v1/orders/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/orders/:id/status', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      orderId = response.body.data._id;
    });

    it('should update order status as farmer', async () => {
      const updateData = {
        status: 'confirmed',
      };

      const response = await request(testApp)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe('confirmed');
    });

    it('should fail to update status as order owner (user)', async () => {
      const updateData = {
        status: 'confirmed',
      };

      const response = await request(testApp)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should fail to update status without authentication', async () => {
      const updateData = {
        status: 'confirmed',
      };

      const response = await request(testApp)
        .patch(`/api/v1/orders/${orderId}/status`)
        .send(updateData)
        .expect(401);
    });

    it('should fail to update with invalid status', async () => {
      const updateData = {
        status: 'invalid_status',
      };

      const response = await request(testApp)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should update payment status', async () => {
      const updateData = {
        paymentStatus: 'paid',
      };

      const response = await request(testApp)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.paymentStatus).toBe('paid');
    });

    it('should update both status and paymentStatus', async () => {
      const updateData = {
        status: 'shipped',
        paymentStatus: 'paid',
      };

      const response = await request(testApp)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe('shipped');
      expect(response.body.data.paymentStatus).toBe('paid');
    });
  });

  describe('GET /api/v1/orders/farmer/:farmerId', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const response = await request(testApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      orderId = response.body.data._id;
    });

    it('should get orders for farmer products', async () => {
      const response = await request(testApp)
        .get('/api/v1/orders/farmer/my-orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail to get farmer orders without authentication', async () => {
      const response = await request(testApp)
        .get('/api/v1/orders/farmer/my-orders')
        .expect(401);
    });

    it('should fail to get farmer orders as non-farmer', async () => {
      const response = await request(testApp)
        .get('/api/v1/orders/farmer/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return empty array for farmer with no orders', async () => {
      // Clear all orders first
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
        .get('/api/v1/orders/farmer/my-orders')
        .set('Authorization', `Bearer ${farmerToken2}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });
});
