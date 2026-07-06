import { ProductController } from "../controllers/product.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const productRouter = Router();
const productController = new ProductController();

// Public routes - anyone can view products
productRouter.get("/", productController.getAllProducts);
productRouter.get("/search", productController.searchProducts);
productRouter.get("/category/:category", productController.getProductsByCategory);

// Farmer routes - must come BEFORE /:id to avoid being swallowed by the wildcard
productRouter.get("/farmer/my-products",
    authorizedMiddleware,
    productController.getFarmerProducts
);

productRouter.post("/",
    authorizedMiddleware,
    uploads.single("image"),
    productController.createProduct
);

productRouter.get("/:id", productController.getProductById);

productRouter.put("/:id",
    authorizedMiddleware,
    uploads.single("image"),
    productController.updateProduct
);

productRouter.delete("/:id",
    authorizedMiddleware,
    productController.deleteProduct
);

export default productRouter;
