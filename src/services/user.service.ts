import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http_exception";
import bycryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: CreateUserDto): Promise<IUser> {
        // validation
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        if (userData.username) {
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }
        // hash password
        const hashedPassword = await bycryptjs.hash(userData.password, 10);
        const userToCreate: Partial<IUser> = {
            ...userData,
            password: hashedPassword
        };
        const user = await userRepository.create(userToCreate);
        return user;
    }

    async loginUser(loginData: LoginUserDto){
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }
        const isPasswordValid = await bycryptjs.compare(
            loginData.password,  // client password
            user.password // database password
        );
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid password");
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // payload
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { user, token }
    }
    async updateUser(id: string, userData: UpdateUserDto): Promise<IUser> {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            throw new HttpException(404, "User not found");
        }
        if (userData.email && userData.email !== (existingUser as any).email) {
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                throw new HttpException(400, "Email already exists");
            }
        }
        if (userData.username && userData.username !== (existingUser as any).username) {
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }
        if (userData.password) {
            const hashedPassword = await bycryptjs.hash(userData.password, 10);
            userData.password = hashedPassword;
        }
        const updatedUser = await userRepository.update(id, userData as any);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user");
        }
        return updatedUser;
    }

    // Admin methods
    async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
        const result = await userRepository.findWithPagination(page, limit, search);
        return result;
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    async createUserByAdmin(userData: CreateUserDto): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        if (userData.username) {
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }
        const hashedPassword = await bycryptjs.hash(userData.password, 10);
        const userToCreate: Partial<IUser> = {
            ...userData,
            password: hashedPassword
        };
        const user = await userRepository.create(userToCreate);
        return user;
    }

    async updateUserByAdmin(id: string, userData: UpdateUserDto): Promise<IUser> {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            throw new HttpException(404, "User not found");
        }
        if (userData.email && userData.email !== (existingUser as any).email) {
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                throw new HttpException(400, "Email already exists");
            }
        }
        if (userData.username && userData.username !== (existingUser as any).username) {
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }
        if (userData.password) {
            const hashedPassword = await bycryptjs.hash(userData.password, 10);
            userData.password = hashedPassword;
        }
        const updatedUser = await userRepository.update(id, userData as any);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user");
        }
        return updatedUser;
    }

    async deleteUser(id: string): Promise<boolean> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        const deleted = await userRepository.delete(id);
        return deleted;
    }
}