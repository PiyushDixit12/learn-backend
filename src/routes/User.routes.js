import {Router} from "express";
import {changeCurrentPassword,getCurrentUser,loginUser,logoutUser,refreshAccessToken,registerUser,updateUserAvatar,updateUserCoverImage,updateUserDetails} from "../controllers/User.controller.js";
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

router.route("/generate-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT,changeCurrentPassword);

router.route("/getCurrentUser").post(verifyJWT,getCurrentUser);

router.route("/update-user-details").post(verifyJWT,updateUserDetails);

router.route("/change-avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar);

router.route("/change-coverImage").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage);

export default router;