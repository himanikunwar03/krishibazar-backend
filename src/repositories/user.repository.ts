export {};
import UserModel from "../models/user.model";
const User = UserModel;
import { IUser } from "../models/user.model";
export interface IUserRepository {
    findByUsername(username: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserById(id: string): Promise<IUser | null>;
    // 5 common mandatory methods for any repository
    create(user: Partial<IUser>): Promise<IUser>;
    findById(id: string): Promise<IUser | null>;
    findAll(): Promise<IUser[]>;
    update(id: string, user: Partial<IUser>)
        : Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
    // Admin methods
    findWithPagination(page: number, limit: number, search?: string): Promise<{ users: IUser[], total: number, page: number, limit: number, totalPages: number }>;
}
export class UserMongoRepository implements IUserRepository {
    async findByUsername(username: string): Promise<IUser | null> {
        const foundUser = await User.findOne({ username: username });
        return foundUser;
    }
    async findByEmail(email: string): Promise<IUser | null> {
        const foundUser = await User.findOne({ email: email });
        return foundUser;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const foundUser = await User.findOne({ username: username });
        return foundUser;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const foundUser = await User.findOne({ email: email });
        return foundUser;
    }
    async getUserById(id: string): Promise<IUser | null> {
        const foundUser = await User.findById(id);
        return foundUser;
    }
    async create(user: Partial<IUser>): Promise<IUser> {
        const createdUser = await User.create(user);
        return createdUser;
    }
    async findById(id: string): Promise<IUser | null> {
        const foundUser = await User.findById(id);
        return foundUser;
    }

    async findAll(): Promise<IUser[]> {
        const users = await User.find();
        return users;
    }
    async update(id: string, user: Partial<IUser>)
        : Promise<IUser | null> {
        const updatedUser = await User.findByIdAndUpdate(id, user, { returnDocument: 'after' });
        return updatedUser;
    }
    async delete(id: string): Promise<boolean> {
        const deletedUser = await User.findByIdAndDelete(id);
        return !!deletedUser; // return true if deleted, false if not found
    }

    async findWithPagination(page: number, limit: number, search?: string): Promise<{ users: IUser[], total: number, page: number, limit: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        let query: any = {};
        
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            users,
            total,
            page,
            limit,
            totalPages
        };
    }
}