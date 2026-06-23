import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create a DTO for creating a user
export const CreateUserDto = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "user", "customer"]).default("user")
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

// Login Dto
export const LoginUserDto = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});
export type LoginUserDto = z.infer<typeof LoginUserDto>;

export const UpdateUserDto = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email().optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["admin", "user", "customer"]).optional(),
    profileImage: z.string().optional()
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;