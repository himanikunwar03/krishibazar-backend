import { z } from "zod";
import { OrderSchema, OrderItemSchema } from "../types/order.type";

// Create Order DTO
export const CreateOrderDto = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
    })),
    shippingAddress: z.object({
        street: z.string().min(1, "Street address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zipCode: z.string().min(1, "Zip code is required"),
        phone: z.string().min(10, "Phone number must be at least 10 digits")
    }),
    paymentMethod: z.enum(["cod", "esewa", "khalti"]).default("cod"),
    paymentToken: z.string().optional()
});
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;

// Update Order Status DTO (for farmers/admins)
export const UpdateOrderStatusDto = z.object({
    status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
    paymentStatus: z.enum(["pending", "paid", "failed"]).optional()
});
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDto>;
