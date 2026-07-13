import { FavoriteService } from "../services/favorite.service";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper";
import { Request, Response } from "express";
import "../middlewares/authorized.middleware";

const favoriteService = new FavoriteService();

const AddFavoriteDto = z.object({
    productId: z.string().min(1, "Product id is required")
});

export class FavoriteController {
    async addFavorite(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const parsed = AddFavoriteDto.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const favorite = await favoriteService.addFavorite(req.user._id, parsed.data.productId);
            return ApiResponseHelper.success(res, favorite, "Product added to favorites", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async removeFavorite(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const { productId } = req.params;
            const removed = await favoriteService.removeFavorite(req.user._id, productId);
            return ApiResponseHelper.success(res, { removed }, "Product removed from favorites");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getFavorites(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not authenticated", 401);
            }

            const favorites = await favoriteService.getUserFavorites(req.user._id);
            return ApiResponseHelper.success(res, favorites, "Favorites fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
