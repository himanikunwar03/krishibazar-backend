export {}; 
import{z} from"zod";

export const OrderItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    productImage: z.string().optional(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    farmerId: z.string()
});

export const OrderSchema = z.object({
    userId: z.string(),
    items: z.array(OrderItemSchema),
    totalAmount: z.number().positive(),
    status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
    shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        phone: z.string()
    }),
    paymentMethod: z.enum(["cod", "esewa", "khalti"]).default("cod"),
    paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending")
});

export type OrderType = z.infer<typeof OrderSchema>;
export type OrderItemType = z.infer<typeof OrderItemSchema>;
