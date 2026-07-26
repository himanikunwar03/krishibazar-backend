import { FavoriteController } from "../controllers/favorite.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const favoriteRouter = Router();
const favoriteController = new FavoriteController();

// All favorite routes require authentication
favoriteRouter.use(authorizedMiddleware);

favoriteRouter.get("/", favoriteController.getFavorites);
favoriteRouter.get("/check/:productId", favoriteController.checkFavorite);
favoriteRouter.post("/", favoriteController.addFavorite);
favoriteRouter.delete("/:productId", favoriteController.removeFavorite);

export default favoriteRouter;
