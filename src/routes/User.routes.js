import {Router} from "express";
import {
    changeCurrentPassword
    ,getCurrentUser
    ,getUserChannelProfile
    ,getWatchHistory
    ,loginUser
    ,logoutUser
    ,refreshAccessToken
    ,registerUser
    ,updateUserAvatar
    ,updateUserCoverImage
    ,updateUserDetails
} from "../controllers/User.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();


/**
 * @openapi
 * tags:
 *   name: Users
 *   description: API endpoints to manage users
 */

// REGISTER USER  
/**
 * @openapi
 *   /users/register:
 *     post:
 *       summary: Register a new user with avatar and cover image
 *       tags: [Users]
 *       requestBody:
 *         required: true
 *         description: JSON object containing user information and image files
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                   description: The full name of the user
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email address of the user
 *                 password:
 *                   type: string
 *                   format: password
 *                   description: The password for the user account
 *                 userName:
 *                   type: string
 *                   description: The username for the user account
 *                 avatar:
 *                   type: string
 *                   format: binary
 *                   description: Avatar image file 
 *                 coverImage:
 *                   type: string
 *                   format: binary
 *                   description: Cover image file (optional)
 *               required:
 *                 - fullName
 *                 - email
 *                 - password
 *                 - userName
 *                 - avatar
 *       responses:
 *         '201':
 *           description: User created successfully
 *           content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: User Created
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   properties:
 *                      _id: 
 *                        type: string
 *                        description: user id
 *                      userName: 
 *                        type: string
 *                        description: user name
 *                      email: 
 *                        type: string
 *                        description: user email
 *                      fullName: 
 *                        type: string
 *                        description: user full name
 *                      avatar: 
 *                        type: string
 *                        description: user avatar url
 *                      coverImage: 
 *                        type: string
 *                        description: user coverImage url
 *                      createdAt: 
 *                        type: string
 *                        description: user created time
 *                      updatedAt: 
 *                        type: string
 *                        description: user update time last
 *         '400':
 *           $ref: '#/components/responses/400'
 *         '401':
 *           $ref: '#/components/responses/401'
 *         '404':
 *           $ref: '#/components/responses/404'
 */

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


// LOGIN USER 
/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email (optional if userName is provided)
 *               userName:
 *                 type: string
 *                 description: User's username (optional if email is provided)
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - password
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: User Logged in Successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "id"
 *                         userName:
 *                           type: string
 *                           example: "string"
 *                         email:
 *                           type: string
 *                           example: "user@gmail.com"
 *                         fullName:
 *                           type: string
 *                           example: "piyush dixit"
 *                         avatar:
 *                           type: string
 *                           example: "avatar url"
 *                         coverImage:
 *                           type: string
 *                           example: "cover image url"
 *                         watchHistory:
 *                           type: array
 *                           items: {}
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-10T07:45:06.744Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-10T08:39:13.713Z"
 *                     accessToken:
 *                       type: string
 *                       example: "access token...."
 *                     refreshToken:
 *                       type: string
 *                       example: "refresh token...."
 *       '400':
 *         description: Bad request. Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400'
 *       '401':
 *         $ref: '#/components/responses/401'
 */

router.route("/login").post(loginUser);

// secure route

// LOGOUT USER 
/**
 * @openapi
 * /users/logout:
 *   post:
 *     summary: User logout
 *     tags: [Users]
 *     security:
 *       - JWT: []
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '401':
 *         $ref: '#/components/responses/401'
 */
router.route("/logout").post(verifyJWT,logoutUser)

// GENERATE TOKEN
/**
/**
 * @openapi
 * /users/generate-token:
 *   post:
 *     summary: Generate access token
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (optional if refreshToken is provided in cookies)
 *     responses:
 *       '200':
 *         description: Access token and refresh token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: accessToken and refreshToken generated successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."

 *       '401':
 *         $ref: '#/components/responses/401'
 */

router.route("/generate-token").post(refreshAccessToken);

// CHANGE USER PASSWORD
/**
 * @openapi
 * /users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: Password Change successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties: {}
 *       '401':
 *         $ref: '#/components/responses/401'
 */
router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
);

// GET CURRENT USER 
/**
 * @openapi
 * /users/getCurrentUser:
 *   post:
 *     summary: Get current user details
 *     tags: [Users]
 *     security:
 *       - JWT: []
 *     responses:
 *       '200':
 *           description: User fetched successfully
 *           content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: User fetched
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   properties:
 *                      _id: 
 *                        type: string
 *                        description: user id
 *                      userName: 
 *                        type: string
 *                        description: user name
 *                      email: 
 *                        type: string
 *                        description: user email
 *                      fullName: 
 *                        type: string
 *                        description: user full name
 *                      avatar: 
 *                        type: string
 *                        description: user avatar url
 *                      coverImage: 
 *                        type: string
 *                      watchHistory: 
 *                        type: array
 *                        description: user video watch history
 *                        example: []
 *                      createdAt: 
 *                        type: string
 *                        description: user created time
 *                      updatedAt: 
 *                        type: string
 *                        description: user update time last
 *       '401':
 *         $ref: '#/components/responses/401'
 */
router.route("/getCurrentUser").post(
    verifyJWT,
    getCurrentUser
);

// UPDATE USER DETAIL'S
/**
 * @openapi
 * /users/update-user-details:
 *   patch:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - fullName
 *               - email
 *     responses:
 *       '200':
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: details updated successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "663dd0826684b7dbac968c19"
 *                     userName:
 *                       type: string
 *                       example: "string"
 *                     email:
 *                       type: string
 *                       example: "user@gmail.com"
 *                     fullName:
 *                       type: string
 *                       example: "dixit ji"
 *                     avatar:
 *                       type: string
 *                       example: "url"
 *                     coverImage:
 *                       type: string
 *                       example: "url"
 *                     watchHistory:
 *                       type: array
 *                       items: {}
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-10T07:45:06.744Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-10T08:58:57.411Z"
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
 *       '401':
 *         $ref: '#/components/responses/401'
 */
router.route("/update-user-details").patch(
    verifyJWT,
    updateUserDetails
);

// CHANGE AVATAR IMAGE
/**
 * @openapi
 * /users/change-avatar:
 *   post:
 *     summary: Change user avatar
 *     tags: [Users]
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *             required:
 *               - avatar
 *     responses:
*       '200':
 *         description: User avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: avatar changed successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "663dd0826684b7dbac968c19"
 *                     userName:
 *                       type: string
 *                       example: "string"
 *                     email:
 *                       type: string
 *                       example: "user@gmail.com"
 *                     fullName:
 *                       type: string
 *                       example: "dixit ji"
 *                     avatar:
 *                       type: string
 *                       example: "url"
 *                     coverImage:
 *                       type: string
 *                       example: "url"
 *                     watchHistory:
 *                       type: array
 *                       items: {}
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-10T07:45:06.744Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-10T08:58:57.411Z"
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
 *       '401':
 *         $ref: '#/components/responses/401'
 */
router.route("/change-avatar").post(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

// CHANGE COVER IMAGE 
/**
 * @openapi
 * /users/change-coverImage:
 *   post:
 *     summary: Change user cover image
 *     tags: [Users]
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *             required:
 *               - coverImage
 *     responses:
*       '200':
 *         description: User cover image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: cover image updated successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "663dd0826684b7dbac968c19"
 *                     userName:
 *                       type: string
 *                       example: "string"
 *                     email:
 *                       type: string
 *                       example: "user@gmail.com"
 *                     fullName:
 *                       type: string
 *                       example: "dixit ji"
 *                     avatar:
 *                       type: string
 *                       example: "url"
 *                     coverImage:
 *                       type: string
 *                       example: "url"
 *                     watchHistory:
 *                       type: array
 *                       items: {}
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-10T07:45:06.744Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-10T08:58:57.411Z"
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
 *       '401':
 *         $ref: '#/components/responses/401'
 */
router.route("/change-coverImage").post(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

// FIND CHANEL BY USER NAME
/**
 * @openapi
 *   /users/channel/{userName}:
 *     get:
 *       summary: Get user channel profile
 *       tags: [Users]
 *       parameters:
 *         - in: path
 *           name: userName
 *           schema:
 *             type: string
 *           required: true
 *           description: Username of the user
 *       responses:
 *         '200':
 *          description: User channel profile fetched successfully
 *          content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: success
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66156402c3a2edff161c852c"
 *                       userName:
 *                         type: string
 *                         example: "dixit ji"
 *                       email:
 *                         type: string
 *                         example: "piyushd.bca2022@ssism.org"
 *                       fullName:
 *                         type: string
 *                         example: "Piyush Dixit"
 *                       avatar:
 *                         type: string
 *                         example: "https://res.cloudinary.com/ds04hrf6o/image/upload/v1713168473/unegyudnshcsadajezks.png"
 *                       coverImage:
 *                         type: string
 *                         example: "https://res.cloudinary.com/ds04hrf6o/image/upload/v1713169477/smrb3y3uzzp8q7ieac0m.png"
 *                       subscribersCount:
 *                         type: integer
 *                         example: 0
 *                       channelSubscribedCount:
 *                         type: integer
 *                         example: 0
 *                       isSubscribed:
 *                         type: boolean
 *                         example: false
 *         '400':
 *           $ref: '#/components/responses/400'
 *         '401':
 *           $ref: '#/components/responses/401'
 *         '404':
 *           $ref: '#/components/responses/404'
 */
router.route("/channel/:userName").get(
    verifyJWT,
    getUserChannelProfile
);

// GET WATCH HISTORY OF USER
/**
 * @openapi
 * /users/history:
 *   get:
 *     summary: Get Watch History
 *     description: Retrieve the watch history for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - JWT: []
 *     responses:
 *       '200':
 *         description: Watch History fetched Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the operation result
 *                   example: Watch History fetched Successfully
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code for the response
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful
 *                   example: true
 *                 data:
 *                   type: array
 *                   items: {}
 *       '401':
 *         $ref: '#/components/responses/401'
 *       '404':
 *         $ref: '#/components/responses/404'
 */
router.get("/history",
    verifyJWT,
    getWatchHistory
);

export default router;