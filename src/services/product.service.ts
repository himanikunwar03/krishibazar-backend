import { ProductMongoRepository } from "../repositories/product.repository";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { IProduct } from "../models/product.model";
import { HttpException } from "../exceptions/http_exception";

const productRepository = new ProductMongoRepository();

export class ProductService {
    async createProduct(productData: CreateProductDto, farmerId: string): Promise<IProduct> {
        const productToCreate: Partial<IProduct> = {
            ...productData,
            farmerId,
            status: productData.stock > 0 ? 'available' : 'out_of_stock'
        };
        const product = await productRepository.create(productToCreate);
        return product;
    }

    async getAllProducts(page: number = 1, limit: number = 10, category?: string, search?: string) {
        const result = await productRepository.findWithPagination(page, limit, category, search);
        return result;
    }

    async getProductById(id: string): Promise<IProduct> {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new HttpException(404, "Product not found");
        }
        return product;
    }

    async getFarmerProducts(farmerId: any, page: number = 1, limit: number = 10, search?: string) {
        const farmerIdStr = farmerId?.toString();
        const allFarmerProducts = await productRepository.findByFarmer(farmerIdStr);
        const filtered = search
            ? allFarmerProducts.filter((p: any) =>
                p.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.description?.toLowerCase().includes(search.toLowerCase())
              )
            : allFarmerProducts;
        const total = filtered.length;
        const start = (page - 1) * limit;
        const products = filtered.slice(start, start + limit);
        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateProduct(id: string, productData: UpdateProductDto, farmerId: string): Promise<IProduct> {
        const existingProduct = await productRepository.findById(id);
        if (!existingProduct) {
            throw new HttpException(404, "Product not found");
        }

        // Check if the product belongs to the farmer
        if ((existingProduct as any).farmerId?.toString() !== farmerId?.toString()) {
            throw new HttpException(403, "You can only update your own products");
        }

        // Update status based on stock
        if (productData.stock !== undefined) {
            productData.status = productData.stock > 0 ? 'available' : 'out_of_stock';
        }

        const updatedProduct = await productRepository.update(id, productData);
        if (!updatedProduct) {
            throw new HttpException(500, "Failed to update product");
        }
        return updatedProduct;
    }

    async deleteProduct(id: string, farmerId: string): Promise<boolean> {
        const existingProduct = await productRepository.findById(id);
        if (!existingProduct) {
            throw new HttpException(404, "Product not found");
        }

        // Check if the product belongs to the farmer
        if ((existingProduct as any).farmerId?.toString() !== farmerId?.toString()) {
            throw new HttpException(403, "You can only delete your own products");
        }

        const deleted = await productRepository.delete(id);
        return deleted;
    }

    async updateProductStock(id: string, quantity: number): Promise<IProduct> {
        const product = await productRepository.updateStock(id, quantity);
        if (!product) {
            throw new HttpException(404, "Product not found");
        }
        return product;
    }

    async searchProducts(query: string): Promise<IProduct[]> {
        const products = await productRepository.searchProducts(query);
        return products;
    }

    async getProductsByCategory(category: string): Promise<IProduct[]> {
        const products = await productRepository.findByCategory(category);
        return products;
    }
}
