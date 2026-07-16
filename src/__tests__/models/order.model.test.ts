import Order from '../../models/order.model';
import { connectToMongoDB } from '../../database/mongodb';

describe('Order Model', () => {
  beforeAll(async () => {
    await connectToMongoDB();
  });

  describe('Order Schema Validation', () => {
    it('should create a valid order with all required fields', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            productImage: 'https://example.com/tomato.jpg',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.userId).toBe(orderData.userId);
      expect(savedOrder.items).toHaveLength(1);
      expect(savedOrder.totalAmount).toBe(orderData.totalAmount);
      expect(savedOrder.shippingAddress.street).toBe(orderData.shippingAddress.street);
    });

    it('should fail to create order without required userId', async () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should create order with empty items array', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.items).toHaveLength(0);
    });

    it('should fail to create order without required totalAmount', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
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

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should fail to create order without required shippingAddress', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should set default status to pending when not provided', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.status).toBe('pending');
    });

    it('should set default paymentMethod to cod when not provided', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.paymentMethod).toBe('cod');
    });

    it('should set default paymentStatus to pending when not provided', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.paymentStatus).toBe('pending');
    });

    it('should allow valid status values', async () => {
      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of statuses) {
        const orderData = {
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: '507f1f77bcf86cd799439012',
              productName: 'Tomato',
              price: 50,
              quantity: 2,
              farmerId: '507f1f77bcf86cd799439013',
            },
          ],
          totalAmount: 100,
          shippingAddress: {
            street: '123 Main St',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            phone: '9800000000',
          },
          status: status as any,
        };

        const order = new Order(orderData);
        const savedOrder = await order.save();
        expect(savedOrder.status).toBe(status);
      }
    });

    it('should fail to create order with invalid status', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        status: 'invalid_status' as any,
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should allow valid paymentMethod values', async () => {
      const paymentMethods = ['cod', 'esewa', 'khalti'];
      
      for (const paymentMethod of paymentMethods) {
        const orderData = {
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: '507f1f77bcf86cd799439012',
              productName: 'Tomato',
              price: 50,
              quantity: 2,
              farmerId: '507f1f77bcf86cd799439013',
            },
          ],
          totalAmount: 100,
          shippingAddress: {
            street: '123 Main St',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            phone: '9800000000',
          },
          paymentMethod: paymentMethod as any,
        };

        const order = new Order(orderData);
        const savedOrder = await order.save();
        expect(savedOrder.paymentMethod).toBe(paymentMethod);
      }
    });

    it('should fail to create order with invalid paymentMethod', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'invalid_method' as any,
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should allow valid paymentStatus values', async () => {
      const paymentStatuses = ['pending', 'paid', 'failed'];
      
      for (const paymentStatus of paymentStatuses) {
        const orderData = {
          userId: '507f1f77bcf86cd799439011',
          items: [
            {
              productId: '507f1f77bcf86cd799439012',
              productName: 'Tomato',
              price: 50,
              quantity: 2,
              farmerId: '507f1f77bcf86cd799439013',
            },
          ],
          totalAmount: 100,
          shippingAddress: {
            street: '123 Main St',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            phone: '9800000000',
          },
          paymentStatus: paymentStatus as any,
        };

        const order = new Order(orderData);
        const savedOrder = await order.save();
        expect(savedOrder.paymentStatus).toBe(paymentStatus);
      }
    });

    it('should fail to create order with invalid paymentStatus', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentStatus: 'invalid_status' as any,
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should fail to create order item without required productId', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          } as any,
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should fail to create order item without required productName', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          } as any,
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should fail to create order item without required price', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          } as any,
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should fail to create order item without required quantity', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            farmerId: '507f1f77bcf86cd799439013',
          } as any,
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should fail to create order item without required farmerId', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
          } as any,
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });

    it('should allow optional productImage in order item', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            productImage: 'https://example.com/tomato.jpg',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.items[0].productImage).toBe('https://example.com/tomato.jpg');
    });

    it('should have createdAt and updatedAt timestamps', async () => {
      const orderData = {
        userId: '507f1f77bcf86cd799439011',
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            productName: 'Tomato',
            price: 50,
            quantity: 2,
            farmerId: '507f1f77bcf86cd799439013',
          },
        ],
        totalAmount: 100,
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder.createdAt).toBeDefined();
      expect(savedOrder.updatedAt).toBeDefined();
      expect(savedOrder.createdAt).toBeInstanceOf(Date);
      expect(savedOrder.updatedAt).toBeInstanceOf(Date);
    });
  });
});
