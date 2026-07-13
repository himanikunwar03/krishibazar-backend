import { FavoriteMongoRepository } from "../repositories/favorite.repository";
import { ProductMongoRepository } from "../repositories/product.repository";
import { HttpException } from "../exceptions/http_exception";

const favoriteRepository = new FavoriteMongoRepository();
const productRepository = new ProductMongoRepository();

export class FavoriteService {
    async addFavorite(userId: string, productId: string) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new HttpException(404, "Product not found");
        }

        const alreadyFavorited = await favoriteRepository.exists(userId, productId);
        if (alreadyFavorited) {
            throw new HttpException(400, "Product already in favorites");
        }

        const favorite = await favoriteRepository.create(userId, productId);
        return favorite;
    }

    async removeFavorite(userId: string, productId: string) {
        const removed = await favoriteRepository.deleteByUserAndProduct(userId, productId);
        if (!removed) {
            throw new HttpException(404, "Favorite not found");
        }
        return removed;
    }

    async getUserFavorites(userId: string) {
        const favorites = await favoriteRepository.findByUser(userId);

        const populated = await Promise.all(
            favorites.map(async (favorite) => {
                const product = await productRepository.findById(favorite.productId);
                if (!product) return null;
                return {
                    _id: favorite._id,
                    productId: favorite.productId,
                    createdAt: favorite.createdAt,
                    product
                };
            })
        );

        return populated.filter((item) => item !== null);
    }
}
