import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper";
import { Request, Response } from "express";
import "../middlewares/authorized.middleware"; // Import to pick up type declaration
const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDto.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }
            const user = await userService.createUser(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(parsedData.error), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, user, "User details fetched successfully");
        }
        catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            const userId = req.user._id;
            console.log("User ID from token:", userId);
            console.log("Uploaded file:", req.file);
            const userData = UpdateUserDto.safeParse(req.body);
            console.log("Parsed user data:", userData);
            if (!userData.success) {
                return ApiResponseHelper
                    .error(res, z.prettifyError(userData.error), 400);
            }

            if (req.file) {
                userData.data.profileImage = "/uploads/" + req.file.filename; // add profileImage path to body
                console.log("Profile image path set to:", userData.data.profileImage);
            }
            const updatedUser = await userService.updateUser(userId, userData.data);
            console.log("Updated user from service:", updatedUser);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

}