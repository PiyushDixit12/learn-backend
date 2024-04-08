import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

// PASTE FOR DOTENV 
// "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

async function connectDB() {
    try {
        console.log(process.env.MONGODB_URL);
        const mongoResponse = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`mongoDB connected ! HOST :- `,mongoResponse.connection.host);
    } catch(error) {
        console.log("MONGODB CONNECTION FAILED:- ",error);
        process.exit(1);
    }
}
export default connectDB;