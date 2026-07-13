import app from "./app";
import { PORT as API_PORT } from "./configs/constant";
import { connectToMongoDB } from "./database/mongodb";

console.log("Starting server...");
console.log("PORT:", API_PORT);

connectToMongoDB().then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
});

const port = typeof API_PORT === 'string' ? parseInt(API_PORT, 10) : API_PORT;

app.listen(
    port, '0.0.0.0',  // start backend in this PORT on all interfaces
    () => {
        console.log(`Server running on port ${port}`); // backtick
    }
).on('error', (err) => {
    console.error("Server failed to start:", err);
});
// execute: npx tsx --watch index.ts
// http://localhost:8089