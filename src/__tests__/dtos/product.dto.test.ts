import { CreateProductDto, UpdateProductDto } from '../../dtos/product.dto';

describe('Product DTOs', () => {
  describe('CreateProductDto', () => {
    it('should validate valid product data', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables' as const,
        image: 'https://example.com/tomato.jpg',
        unit: 'kg',
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(true);
    });

    it('should fail validation without name', () => {
      const productData = {
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without price', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without category', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with negative price', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: -50,
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with zero price', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 0,
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with negative stock', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: -10,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('should allow zero stock', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 0,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(true);
    });

    it('should allow optional description', () => {
      const productData = {
        name: 'Tomato',
        price: 50,
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(true);
    });

    it('should allow optional image', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(true);
    });

    it('should default unit to kg', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables' as const,
      };

      const result = CreateProductDto.safeParse(productData);
      if (result.success) {
        expect(result.data.unit).toBe('kg');
      }
    });

    it('should accept all valid categories', () => {
      const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic Certified', 'Other'] as const;
      
      for (const category of categories) {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: 100,
          category: category,
        };

        const result = CreateProductDto.safeParse(productData);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid category', () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'InvalidCategory' as any,
      };

      const result = CreateProductDto.safeParse(productData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateProductDto', () => {
    it('should validate with all optional fields', () => {
      const updateData = {
        name: 'Updated Tomato',
        description: 'Updated description',
        price: 60,
        stock: 150,
        category: 'Vegetables' as const,
        image: 'https://example.com/updated.jpg',
        status: 'available' as const,
        unit: 'kg',
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate with no fields', () => {
      const updateData = {};

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const updateData = {
        name: 'Updated Tomato',
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const updateData = {
        price: -50,
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const updateData = {
        price: 0,
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject negative stock', () => {
      const updateData = {
        stock: -10,
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should allow zero stock', () => {
      const updateData = {
        stock: 0,
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const updateData = {
        category: 'InvalidCategory' as any,
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const updateData = {
        status: 'invalid_status' as any,
      };

      const result = UpdateProductDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid statuses', () => {
      const statuses = ['available', 'out_of_stock', 'disabled'] as const;
      
      for (const status of statuses) {
        const updateData = {
          status: status,
        };

        const result = UpdateProductDto.safeParse(updateData);
        expect(result.success).toBe(true);
      }
    });
  });
});
