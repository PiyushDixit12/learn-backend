import {Router} from "express";
import {loginUser,logoutUser,registerUser} from "../controllers/User.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
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

router.route("/login").post(loginUser);

// secure route 
router.route("/logout").post(verifyJWT,logoutUser)

export default router;