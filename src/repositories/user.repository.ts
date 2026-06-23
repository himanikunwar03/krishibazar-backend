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
}