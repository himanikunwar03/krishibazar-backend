import { z } from "zod";
import { ProductSchema } from "../types/product.type";

// Create a DTO for creating a product
export const CreateProductDto = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().nonnegative("Stock must be non-negative"),
    category: z.enum(["Vegetables", "Fruits", "Grains", "Dairy", "Organic Certified", "Other"]),
    image: z.string().optional(),
    unit: z.string().default("kg")
});
export type CreateProductDto = z.infer<typeof CreateProductDto>;

// Update Product DTO
export const UpdateProductDto = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    category: z.enum(["Vegetables", "Fruits", "Grains", "Dairy", "Organic Certified", "Other"]).optional(),
    image: z.string().optional(),
    status: z.enum(["available", "out_of_stock", "disabled"]).optional(),
    unit: z.string().optional()
});
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
