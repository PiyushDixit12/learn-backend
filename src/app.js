import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import userRouter from './routes/User.routes.js'

const app = express();

// removing cors error
app.use(cors(
    {
        "origin": process.env.CORS_ORIGIN,
        "credentials": true
    }
));

// allowing user body data for post request
app.use(express.json({limit: "20kb"}));

// url encoded to get data for search query
app.use(express.urlencoded({"extended": true,"limit": "20kb"}));

// setting public folder where all data are here 
app.use(express.static("public"));

//  this is used to store data in client browser only server can read and server can write
app.use(cookieParser());

// routes are here 
app.use("/api/v1/users",userRouter);




export {app};