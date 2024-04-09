
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {uploadOnCloudinary} from '../utils/cloudinaryFile.js';
import {User} from '../models/User.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';

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




export {registerUser};