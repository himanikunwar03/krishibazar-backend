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

app.listen(
    API_PORT,  // start backend in this PORT
    () => {
        console.log(`Server running on port ${API_PORT}`); // backtick
    }
).on('error', (err) => {
    console.error("Server failed to start:", err);
});
// execute: npx tsx --watch index.ts
// http://localhost:8089