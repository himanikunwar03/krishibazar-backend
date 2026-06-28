import { AdminController } from "../controllers/admin.controller";
import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminRouter = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
adminRouter.use(authorizedMiddleware);
adminRouter.use(adminMiddleware);

// GET /api/v1/admin/users - Get paginated users with optional search
adminRouter.get("/users", adminController.getAllUsers);

// GET /api/v1/admin/users/:id - Get single user by ID
adminRouter.get("/users/:id", adminController.getUserById);

// POST /api/v1/admin/users - Create a new user
adminRouter.post("/users", adminController.createUser);

// PUT /api/v1/admin/users/:id - Update a user
adminRouter.put("/users/:id", adminController.updateUser);

// PATCH /api/v1/admin/users/:id - Update a user (alternative to PUT)
adminRouter.patch("/users/:id", adminController.updateUser);

// DELETE /api/v1/admin/users/:id - Delete a user
adminRouter.delete("/users/:id", adminController.deleteUser);

export default adminRouter;
