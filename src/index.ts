import app from "./app";
import { PORT as API_PORT } from "./configs/constant";
import { connectToMongoDB } from "./database/mongodb";

connectToMongoDB();

app.listen(
    API_PORT,  // start backend in this PORT
    () => {
        console.log(`Server: http://localhost:${API_PORT}`); // backtick
    }
);
// execute: npx tsx --watch index.ts
// http://localhost:8089