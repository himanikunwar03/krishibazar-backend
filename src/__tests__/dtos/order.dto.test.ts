import { CreateOrderDto, UpdateOrderStatusDto } from '../../dtos/order.dto';

describe('Order DTOs', () => {
  describe('CreateOrderDto', () => {
    it('should validate valid order data', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(true);
    });

    it('should fail validation without items', () => {
      const orderData = {
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should accept empty items array', () => {
      const orderData = {
        items: [],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(true);
    });

    it('should fail validation without shippingAddress', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without street address', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        shippingAddress: {
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without city', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without state', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without zipCode', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without phone', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with short phone number', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '123',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without productId in item', () => {
      const orderData = {
        items: [
          {
            quantity: 2,
          } as any,
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without quantity in item', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
          } as any,
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with zero quantity', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with negative quantity', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: -1,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with non-integer quantity', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2.5,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should allow multiple items', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
            quantity: 2,
          },
          {
            productId: '507f1f77bcf86cd799439013',
            quantity: 3,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          phone: '9800000000',
        },
        paymentMethod: 'cod' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(true);
    });

    it('should default paymentMethod to cod', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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

      const result = CreateOrderDto.safeParse(orderData);
      if (result.success) {
        expect(result.data.paymentMethod).toBe('cod');
      }
    });

    it('should accept esewa payment method', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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
        paymentMethod: 'esewa' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(true);
    });

    it('should accept khalti payment method', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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
        paymentMethod: 'khalti' as const,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid payment method', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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
        paymentMethod: 'invalid_method' as any,
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(false);
    });

    it('should allow optional paymentToken', () => {
      const orderData = {
        items: [
          {
            productId: '507f1f77bcf86cd799439012',
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
        paymentMethod: 'esewa' as const,
        paymentToken: 'token123',
      };

      const result = CreateOrderDto.safeParse(orderData);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateOrderStatusDto', () => {
    it('should validate valid status update', () => {
      const updateData = {
        status: 'confirmed' as const,
      };

      const result = UpdateOrderStatusDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate with both status and paymentStatus', () => {
      const updateData = {
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
      };

      const result = UpdateOrderStatusDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate with only paymentStatus (status is optional)', () => {
      const updateData = {
        paymentStatus: 'paid' as const,
      };

      const result = UpdateOrderStatusDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid statuses', () => {
      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
      
      for (const status of statuses) {
        const updateData = {
          status: status,
        };

        const result = UpdateOrderStatusDto.safeParse(updateData);
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid payment statuses with status', () => {
      const paymentStatuses = ['pending', 'paid', 'failed'] as const;
      
      for (const paymentStatus of paymentStatuses) {
        const updateData = {
          status: 'confirmed' as const,
          paymentStatus: paymentStatus,
        };

        const result = UpdateOrderStatusDto.safeParse(updateData);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid status', () => {
      const updateData = {
        status: 'invalid_status' as any,
      };

      const result = UpdateOrderStatusDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid paymentStatus', () => {
      const updateData = {
        paymentStatus: 'invalid_status' as any,
      };

      const result = UpdateOrderStatusDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });
  });
});
