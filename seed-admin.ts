import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UserModel from "./src/models/user.model";
import { connectToMongoDB } from "./src/database/mongodb";

async function seedAdmin() {
    try {
        await connectToMongoDB();
        console.log("Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await UserModel.findOne({ email: "admin@krishibazar.com" });
        if (existingAdmin) {
            console.log("Admin user already exists with email: admin@krishibazar.com");
            console.log("Admin credentials:");
            console.log("Email: admin@krishibazar.com");
            console.log("Password: admin123");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Create admin user
        const adminUser = await UserModel.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@krishibazar.com",
            username: "admin",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin user created successfully!");
        console.log("Admin credentials:");
        console.log("Email: admin@krishibazar.com");
        console.log("Password: admin123");
        console.log("User ID:", adminUser._id);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin user:", error);
        process.exit(1);
    }
}

seedAdmin();
