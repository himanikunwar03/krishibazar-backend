import mongoose, { Document, Schema } from "mongoose";
import { FavoriteType } from "../types/favorite.type";

export interface IFavorite extends FavoriteType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FavoriteModelSchema: Schema = new Schema<IFavorite>(
    {
        userId: { type: String, required: true },
        productId: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

FavoriteModelSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<IFavorite>(
    "Favorite",
    FavoriteModelSchema
);
