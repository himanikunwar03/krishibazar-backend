import { OrderController } from "../controllers/order.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const orderRouter = Router();
const orderController = new OrderController();

// User routes - require authentication
orderRouter.post("/",
    authorizedMiddleware,
    orderController.createOrder
);

orderRouter.get("/my-orders",
    authorizedMiddleware,
    orderController.getUserOrders
);

orderRouter.get("/:id",
    authorizedMiddleware,
    orderController.getOrderById
);

orderRouter.patch("/:id/cancel",
    authorizedMiddleware,
    orderController.cancelOrder
);

// Farmer routes - require authentication and farmer role
orderRouter.get("/farmer/my-orders",
    authorizedMiddleware,
    orderController.getFarmerOrders
);

orderRouter.patch("/:id/status",
    authorizedMiddleware,
    orderController.updateOrderStatus
);

export default orderRouter;
