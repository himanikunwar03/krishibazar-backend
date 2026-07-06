export {}; 
import{z} from"zod";

export const UserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email:z.email(),
    username: z.string().min(3).optional(),
    password:z.string().min(6),
    role: z.enum(["user", "farmer"]).default("user"),
    profileImage: z.string().optional()
});

export type UserType = z.infer<typeof UserSchema>;