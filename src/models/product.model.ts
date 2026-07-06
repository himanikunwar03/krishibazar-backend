import mongoose,{Document, Schema} from "mongoose";
import { ProductType } from "../types/product.type";

export interface IProduct extends ProductType, Document{
    _id:mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProductModelSchema:Schema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        category: { 
            type: String, 
            enum: ["Vegetables", "Fruits", "Grains", "Dairy", "Organic Certified", "Other"],
            required: true 
        },
        image: { type: String },
        farmerId: { type: String, required: true },
        status: { 
            type: String, 
            enum: ["available", "out_of_stock", "disabled"],
            default: "available" 
        },
        unit: { type: String, default: "kg" },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        ratingCount: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IProduct>(
    "Product",
    ProductModelSchema
);
