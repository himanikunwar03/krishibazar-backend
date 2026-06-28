import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper";
import { Request, Response } from "express";
import "../middlewares/authorized.middleware";

const userService = new UserService();

export class AdminController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await userService.getAllUsers(page, limit, search);
            const response = {
                data: result.users,
                meta: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages
                }
            };
            return ApiResponseHelper.success(res, response, "Users fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDto.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }
            const user = await userService.createUserByAdmin(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userData = UpdateUserDto.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }
            const updatedUser = await userService.updateUserByAdmin(id, userData.data);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await userService.deleteUser(id);
            return ApiResponseHelper.success(res, { deleted }, "User deleted successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
