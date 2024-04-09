import {Router} from "express";
import {registerUser} from "../controllers/User.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        {
            name: "avatar", //same as getting data from frontend on body
            maxCount: 1
        },
        {
            name: "coverImage", //same as getting data from frontend on body
            maxCount: 1
        }
    ]),
    registerUser);


export default router;