import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import userRouter from './routes/User.routes.js'
import healthCheckRouter from "./routes/HealthCheck.routes.js"
import tweetRouter from "./routes/Tweet.routes.js"
import subscriptionRouter from "./routes/Subscription.routes.js"
import videoRouter from "./routes/Video.routes.js"
import commentRouter from "./routes/Comment.routes.js"
import likeRouter from "./routes/Like.routes.js"
import playlistRouter from "./routes/PlayList.routes.js"
import dashboardRouter from "./routes/DashBoard.routes.js"

const app = express();

// removing cors error
app.use(cors(
    {
        "origin": process.env.CORS_ORIGIN,
        "credentials": true
    }
));

// allowing user body data for post request
// app.use(express.json({limit: "50kb"}));
app.use(express.json());

// url encoded to get data for search query
app.use(express.urlencoded({"extended": true,"limit": "20kb"}));

// setting public folder where all data are here 
app.use(express.static("public"));

//  this is used to store data in client browser only server can read and server can write
app.use(cookieParser());

// routes are here 
app.use("/api/v1/healthCheck",healthCheckRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/dashboard",dashboardRouter)




export {app};