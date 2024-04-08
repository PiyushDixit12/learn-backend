import {app} from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv';

dotenv.config({
    "path": './.env'
});

connectDB().then(() => {
    app.listen(process.env.PORT,() => {
        console.log("Express is listening on port ",process.env.PORT);
    });
}).catch((err) => {
    console.log("Connection ERROR ",err);
}); 