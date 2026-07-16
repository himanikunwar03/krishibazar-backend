import { ProductService } from "../services/product.service";
import { z } from "zod";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { ApiResponseHelper } from "../utils/apihelper";
import { Request, Response } from "express";
import "../middlewares/authorized.middleware";

const productService = new ProductService();

export class ProductController {
    async createProduct(req: Request, res: Response) {
        try {
            // Convert string values to numbers for FormData
            const body = {
                ...req.body,
                price: req.body.price ? parseFloat(req.body.price) : undefined,
                stock: req.body.stock ? parseInt(req.body.stock) : undefined,
            };

            const productData = CreateProductDto.safeParse(body);
            if (!productData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(productData.error), 400);
            }

            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            if (req.user.role !== 'farmer') {
                return ApiResponseHelper.error(res, "Only farmers can create products", 403);
            }

            console.log("Creating product for farmer ID:", req.user._id);
            console.log("User data:", req.user);

            if (req.file) {
                productData.data.image = "/uploads/" + req.file.filename;
            }

            const product = await productService.createProduct(productData.data, req.user._id);
            console.log("Product created:", product);
            return ApiResponseHelper.success(res, product, "Product created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const category = req.query.category as string;
            const search = req.query.search as string;

            const result = await productService.getAllProducts(page, limit, category, search);
            const response = {
                data: result.products,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            };
            return ApiResponseHelper.success(res, response, "Products fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);
            return ApiResponseHelper.success(res, product, "Product fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getFarmerProducts(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            if (req.user.role !== 'farmer') {
                return ApiResponseHelper.error(res, "Only farmers can view their products", 403);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            console.log("Fetching products for farmer ID:", req.user._id);
            const result = await productService.getFarmerProducts(req.user._id, page, limit, search);
            console.log("Farmer products result:", result);
            
            const response = {
                data: result.products,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            };
            return ApiResponseHelper.success(res, response, "Farmer products fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            if (req.user.role !== 'farmer') {
                return ApiResponseHelper.error(res, "Only farmers can update products", 403);
            }

            const { id } = req.params;

            // Convert string values to numbers for FormData
            const body = {
                ...req.body,
                price: req.body.price ? parseFloat(req.body.price) : undefined,
                stock: req.body.stock ? parseInt(req.body.stock) : undefined,
            };

            const userData = UpdateProductDto.safeParse(body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }

            if (req.file) {
                userData.data.image = "/uploads/" + req.file.filename;
            }

            const updatedProduct = await productService.updateProduct(id, userData.data, req.user._id);
            return ApiResponseHelper.success(res, updatedProduct, "Product updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            if (req.user.role !== 'farmer') {
                return ApiResponseHelper.error(res, "Only farmers can delete products", 403);
            }

            const { id } = req.params;
            const deleted = await productService.deleteProduct(id, req.user._id);
            return ApiResponseHelper.success(res, { deleted }, "Product deleted successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async searchProducts(req: Request, res: Response) {
        try {
            const query = req.query.q as string;
            if (!query) {
                return ApiResponseHelper.error(res, "Search query is required", 400);
            }

            const products = await productService.searchProducts(query);
            return ApiResponseHelper.success(res, products, "Products fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getProductsByCategory(req: Request, res: Response) {
        try {
            const { category } = req.params;
            const products = await productService.getProductsByCategory(category);
            return ApiResponseHelper.success(res, products, "Products fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
