

import mongoose,{Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";


export interface IUser extends UserType, Document{
    // database related attr
    _id:mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const UserModelSchema:Schema = new Schema<IUser>(
    {
     
        username: { type: String },
        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user", "customer"], default: "user" },
        profileImage: { type: String }

    }
);


export default mongoose.model<IUser>(
    "User", // collection name in db.users
    UserModelSchema

);