
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {uploadOnCloudinary} from '../utils/cloudinaryFile.js';
import {User} from '../models/User.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();

        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};
    } catch(error) {
        console.log(error);
        throw new ApiError(500,"Something went Wrong while generating refresh and access token");
    }
}
// User Register
const registerUser = asyncHandler(async (req,res) => {
    // get data from frontend 
    // check valid or not 
    // check user already present or not  using username and email
    // create user 
    // upload avatar to  local and then coverImage also
    // check user created or not 
    // send to response 
    const {fullName,email,password,userName} = req.body;
    if([fullName,email,password,userName].some((value) => value === "" || value == null)) {
        res.status(400).json(new ApiError(400,"Please provide all fields"));
    }

    const user = await User.findOne({$or: [{userName: userName},{email: email}]});
    if(user) {
        res.status(409).json(new ApiError(409,"User already exists. Please use a different username or email."
        ));
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let avatarResponse = "",coverImageResponse = "";

    if(!avatarLocalPath) {
        throw new ApiError(400,"Please provide avatar Image");
    }
    avatarResponse = await uploadOnCloudinary(avatarLocalPath);

    if(coverImageLocalPath) {
        coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);
    }

    const createdUser = await User.create({
        fullName,
        email,
        userName,
        password,
        avatar: avatarResponse?.secure_url ?? "",
        coverImage: coverImageResponse?.secure_url ?? ""
    });

    const userFind = await User.findById(createdUser._id).select("-password -refreshToken -watchHistory -__v");
    if(!userFind) {
        throw new ApiError(500,"Something went wrong While creating user");
    }

    res.status(200).json(new ApiResponse(201,"User Created",userFind));

});

// User Login 
const loginUser = asyncHandler(async (req,res) => {

    const {email,userName,password} = req.body;
    console.log("request body ",req.body);

    if(!(userName || email || password)) {
        throw new ApiError(400,"email or userName and password is required ");
    };

    const findUser = await User.findOne({$or: [{userName},{email}]});

    if(!findUser) {
        throw new ApiError(400,"User not present with email or userName ");
    };
    const isCorrectPassword = await findUser.isPasswordCorrect(password,findUser.password);

    if(!isCorrectPassword) {
        throw new ApiError(401,"Invalid user password");
    }

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(findUser._id);

    const loggedInUser = await User.findById(findUser._id).select("-password -refreshToken -__v");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,"User Logged in Successfully",{
            user: loggedInUser
            ,accessToken
            ,refreshToken
        }));

});

// secure route can'nt run before login
const logoutUser = asyncHandler(async (req,res) => {
    const user = await User.findByIdAndUpdate(req?.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    );
    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged out"));
});

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingToken) {
        throw new ApiError(401,"Please provide refreshToken");
    };
    try {
        const decodedToken = jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET);
        console.log(decodedToken);
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(401,"Invalid refresh token");
        }

        if(incomingToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is Expired");
        }
        const options = {
            httpOnly: true,
            secure: true
        };
        const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user?._id);

        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,"accessToken and refreshToken generated successfully",{accessToken,refreshToken}));
    } catch(error) {
        throw new ApiError(401,"Something Went Wrong while generating accessToken and refreshToken");
    }
});



export {registerUser,loginUser,logoutUser,refreshAccessToken};