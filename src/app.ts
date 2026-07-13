import express, { Application, NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/http_exception";
import { ApiResponseHelper } from "./utils/apihelper";
import cors from "cors";
import path from "path";
// routes
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";
import favoriteRoutes from "./routes/favorite.route";

const app: Application = express();
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "http://localhost:3001", "*"];
        
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow all vercel.app domains
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        // Allow custom domains
        if (origin === 'https://himanikunwar.com.np' || origin === 'https://www.himanikunwar.com.np') {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}
app.use(cors(corsOptions)); // enable CORS for all routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

// serve static files from uploads folder (if it exists)
const uploadsPath = path.join(__dirname, "../uploads");
try {
    const fs = require('fs');
    if (fs.existsSync(uploadsPath)) {
        app.use("/uploads", express.static(uploadsPath));
    }
} catch (e) {
    console.warn("Uploads folder not found, static file serving disabled");
}
app.use("/api/v1/auth", userRoutes); // user related routes
app.use("/api/v1/admin", adminRoutes); // admin related routes
app.use("/api/v1/products", productRoutes); // product related routes
app.use("/api/v1/orders", orderRoutes); // order related routes
app.use("/api/v1/favorites", favoriteRoutes); // favorite related routes

// global api handler (at the last)
app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "API not found" });
    }
)
// global error handler (at the last)
app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, (err as any).status
            );
        }
        return ApiResponseHelper.error(
            res, err?.message || "Internal Server Error", 500
        );
    }
)

export default app;