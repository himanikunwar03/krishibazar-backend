import Product from '../../models/product.model';
import { connectToMongoDB } from '../../database/mongodb';

describe('Product Model', () => {
  beforeAll(async () => {
    await connectToMongoDB();
  });

  describe('Product Schema Validation', () => {
    it('should create a valid product with all required fields', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe(productData.name);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.stock).toBe(productData.stock);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.farmerId).toBe(productData.farmerId);
    });

    it('should fail to create product without required name', async () => {
      const productData = {
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should fail to create product without required price', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should fail to create product without required category', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should fail to create product without required farmerId', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should set default stock to 0 when not provided', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.stock).toBe(0);
    });

    it('should set default status to available when not provided', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.status).toBe('available');
    });

    it('should set default unit to kg when not provided', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.unit).toBe('kg');
    });

    it('should set default rating to 0 when not provided', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.rating).toBe(0);
    });

    it('should set default ratingCount to 0 when not provided', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.ratingCount).toBe(0);
    });

    it('should allow valid category values', async () => {
      const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic Certified', 'Other'];
      
      for (const category of categories) {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: 100,
          category: category as any,
          farmerId: '507f1f77bcf86cd799439011',
        };

        const product = new Product(productData);
        const savedProduct = await product.save();
        expect(savedProduct.category).toBe(category);
      }
    });

    it('should fail to create product with invalid category', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'InvalidCategory' as any,
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should allow valid status values', async () => {
      const statuses = ['available', 'out_of_stock', 'disabled'];
      
      for (const status of statuses) {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: 100,
          category: 'Vegetables',
          farmerId: '507f1f77bcf86cd799439011',
          status: status as any,
        };

        const product = new Product(productData);
        const savedProduct = await product.save();
        expect(savedProduct.status).toBe(status);
      }
    });

    it('should fail to create product with invalid status', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
        status: 'invalid_status' as any,
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should enforce rating minimum of 0', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
        rating: -1,
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should enforce rating maximum of 5', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
        rating: 6,
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    it('should allow optional description field', async () => {
      const productData = {
        name: 'Tomato',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.description).toBeUndefined();
    });

    it('should allow optional image field', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
        image: 'https://example.com/tomato.jpg',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.image).toBe('https://example.com/tomato.jpg');
    });

    it('should have createdAt and updatedAt timestamps', async () => {
      const productData = {
        name: 'Tomato',
        description: 'Fresh organic tomatoes',
        price: 50,
        stock: 100,
        category: 'Vegetables',
        farmerId: '507f1f77bcf86cd799439011',
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
      expect(savedProduct.createdAt).toBeInstanceOf(Date);
      expect(savedProduct.updatedAt).toBeInstanceOf(Date);
    });
  });
});
