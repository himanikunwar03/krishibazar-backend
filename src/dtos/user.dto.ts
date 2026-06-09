
    //1.create new schema 
    // export const LoginUserDto = z.object({
    // email : z.email(),
    // password: z.string().min)(6),
    //})
    //2. use pick to create 


import { UserSchema } from "../types/user.type";
import { z } from "zod";
// what client sends and need to validate before processing
export const CreateUserDto = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDto =UserSchema.pick({
    email:true,
    password:true,
})
export type LoginUserDto = z.infer<typeof LoginUserDto>;