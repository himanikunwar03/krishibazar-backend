import mongoose,{Document, Schema} from "mongoose";
import { OrderType, OrderItemType } from "../types/order.type";

interface IOrderItem extends OrderItemType, Document {}

export interface IOrder extends OrderType, Document{
    _id:mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema:Schema = new Schema<IOrderItem>(
    {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        productImage: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        farmerId: { type: String, required: true }
    },
    { _id: false }
);

const OrderModelSchema:Schema = new Schema<IOrder>(
    {
        userId: { type: String, required: true },
        items: { type: [OrderItemSchema], required: true },
        totalAmount: { type: Number, required: true },
        status: { 
            type: String, 
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending" 
        },
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            phone: { type: String, required: true }
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "esewa", "khalti"],
            default: "cod"
        },
        paymentStatus: { 
            type: String, 
            enum: ["pending", "paid", "failed"],
            default: "pending" 
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IOrder>(
    "Order",
    OrderModelSchema
);
