export {};
import FavoriteModel from "../models/favorite.model";
const Favorite = FavoriteModel;
import { IFavorite } from "../models/favorite.model";

export interface IFavoriteRepository {
    findByUser(userId: string): Promise<IFavorite[]>;
    exists(userId: string, productId: string): Promise<boolean>;
    create(userId: string, productId: string): Promise<IFavorite>;
    deleteByUserAndProduct(userId: string, productId: string): Promise<boolean>;
}

export class FavoriteMongoRepository implements IFavoriteRepository {
    async findByUser(userId: string): Promise<IFavorite[]> {
        const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
        return favorites;
    }

    async exists(userId: string, productId: string): Promise<boolean> {
        const favorite = await Favorite.findOne({ userId, productId });
        return !!favorite;
    }

    async create(userId: string, productId: string): Promise<IFavorite> {
        const favorite = await Favorite.create({ userId, productId });
        return favorite;
    }

    async deleteByUserAndProduct(userId: string, productId: string): Promise<boolean> {
        const deleted = await Favorite.findOneAndDelete({ userId, productId });
        return !!deleted;
    }
}
