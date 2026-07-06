export {};
import ProductModel from "../models/product.model";
const Product = ProductModel;
import { IProduct } from "../models/product.model";

export interface IProductRepository {
    findById(id: string): Promise<IProduct | null>;
    findAll(): Promise<IProduct[]>;
    findByFarmer(farmerId: string): Promise<IProduct[]>;
    findByCategory(category: string): Promise<IProduct[]>;
    searchProducts(query: string): Promise<IProduct[]>;
    findWithPagination(page: number, limit: number, category?: string, search?: string): Promise<{ products: IProduct[], total: number, page: number, limit: number, totalPages: number }>;
    create(product: Partial<IProduct>): Promise<IProduct>;
    update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<IProduct | null>;
}

export class ProductMongoRepository implements IProductRepository {
    async findById(id: string): Promise<IProduct | null> {
        const foundProduct = await Product.findById(id);
        return foundProduct;
    }

    async findAll(): Promise<IProduct[]> {
        const products = await Product.find({ status: { $ne: 'disabled' } }).sort({ createdAt: -1 });
        return products;
    }

    async findByFarmer(farmerId: string): Promise<IProduct[]> {
        const products = await Product.find({ farmerId }).sort({ createdAt: -1 });
        return products;
    }

    async findByCategory(category: string): Promise<IProduct[]> {
        const products = await Product.find({ category, status: { $ne: 'disabled' } }).sort({ createdAt: -1 });
        return products;
    }

    async searchProducts(query: string): Promise<IProduct[]> {
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ],
            status: { $ne: 'disabled' }
        }).sort({ createdAt: -1 });
        return products;
    }

    async findWithPagination(page: number = 1, limit: number = 10, category?: string, search?: string): Promise<{ products: IProduct[], total: number, page: number, limit: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        let query: any = { status: { $ne: 'disabled' } };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            products,
            total,
            page,
            limit,
            totalPages
        };
    }

    async create(product: Partial<IProduct>): Promise<IProduct> {
        const createdProduct = await Product.create(product);
        return createdProduct;
    }

    async update(id: string, product: Partial<IProduct>): Promise<IProduct | null> {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { returnDocument: 'after' });
        return updatedProduct;
    }

    async delete(id: string): Promise<boolean> {
        const deletedProduct = await Product.findByIdAndDelete(id);
        return !!deletedProduct;
    }

    async updateStock(id: string, quantity: number): Promise<IProduct | null> {
        const product = await Product.findById(id);
        if (!product) return null;
        
        const newStock = (product as any).stock - quantity;
        if (newStock < 0) {
            throw new Error("Insufficient stock");
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { 
                stock: newStock,
                status: newStock === 0 ? 'out_of_stock' : 'available'
            },
            { returnDocument: 'after' }
        );
        return updatedProduct;
    }
}
