import express,{response} from "express";
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
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();

// Define Swagger JSDoc options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Learn Backend Development',
            version: '1.0.0',
            description: 'creating youtube apis from scratch to learn backend with express.js',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT ?? 8080}/api/v1`, // Modify this according to your server URL
            },
        ],
        components: {
            schemas: {
                Users: {
                    type: "object",
                    required: ["userName","email","password"],
                    properties: {
                        userName: {
                            type: 'string',
                            description: "user name for user"
                        },fullName: {
                            type: 'string',
                            description: "fullName  for user"
                        },email: {
                            type: 'string',
                            description: "user email for user"
                        },password: {
                            type: 'string',
                            description: "user password for user"
                        },avatar: {
                            type: 'file',
                            description: "avatar image for user"
                        },coverImage: {
                            type: 'file',
                            description: "coverImage image for user"
                        }

                    }
                }
            },
            responses: {
                400: {
                    description: "bad request",
                    contents: 'application/json'
                },401: {
                    description: "Unauthorized",
                    contents: 'application/json'
                },404: {
                    description: "Not Found ",
                    contents: 'application/json'
                }
            },
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization'
                }
            }
        },
        security: [
            {
                ApiKeyAuth: []
            }
        ]
    },
    apis: ['*/routes/*.routes.js'], // Path to the files containing OpenAPI annotations
    // apis: ['./app.js'], // Path to the files containing OpenAPI annotations for auto generate
};

// Initialize Swagger JSDoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec));

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