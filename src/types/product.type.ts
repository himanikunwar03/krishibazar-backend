export {}; 
import{z} from"zod";

export const ProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    stock: z.number().int().nonnegative("Stock must be non-negative"),
    category: z.enum(["Vegetables", "Fruits", "Grains", "Dairy", "Organic Certified", "Other"]),
    image: z.string().optional(),
    farmerId: z.string(),
    status: z.enum(["available", "out_of_stock", "disabled"]).default("available"),
    unit: z.string().default("kg"),
    rating: z.number().min(0).max(5).default(0),
    ratingCount: z.number().int().nonnegative().default(0)
});

export type ProductType = z.infer<typeof ProductSchema>;
