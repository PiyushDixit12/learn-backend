
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {uploadOnCloudinary} from '../utils/cloudinaryFile.js';
import {User} from '../models/User.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import {Types} from 'mongoose';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();

        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};
    } catch(error) {
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

const changeCurrentPassword = asyncHandler(async (req,res) => {
    // get data from frontend
    const {oldPassword,newPassword} = req.body;

    if([oldPassword,newPassword].some(value => value == "" || value == null)) {
        throw new ApiError(400,"Please provide old Password and new Password ");
    }

    const user = await User.findById(req?.user?._id);

    if(!user) {
        throw new ApiError(400,"User not find with user id" + req?.user?._id);
    }

    const isCorrect = await user.isPasswordCorrect(oldPassword,user.password);

    if(!isCorrect) {
        throw new ApiError(400,"Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    res.status(200).json(new ApiResponse(200,"Password Change successfully",{}));
});

const getCurrentUser = asyncHandler(async (req,res) => {
    return res.status(200).json(new ApiResponse(200,"User fetched successfully ",req?.user))
});

const updateUserDetails = asyncHandler(async (req,res) => {
    const {fullName,email} = req.body;
    if(!fullName || !email) {
        throw new ApiError(400,"All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true} // updated information will return
    ).select("-password -__v");

    return res.status(200).json(new ApiResponse(200,"details updated successfully",user));
});

const updateUserAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar image file path is missing");
    }

    let avatarResponse = await uploadOnCloudinary(avatarLocalPath);

    if(!avatarResponse.secure_url) {
        throw new ApiError(500,"Error while uploading avatar image ");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatarResponse?.secure_url
            }
        },
        {
            new: true
        }
    ).select("-password -__v");

    return res.status(200).json(new ApiResponse(200,"avatar updated successfully",user))

});

const updateUserCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new ApiError(400,"Cover image file path is missing");
    }

    let coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImageResponse.secure_url) {
        throw new ApiError(500,"Error while uploading coverImage ");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImageResponse?.secure_url
            }
        },
        {
            new: true
        }
    ).select("-password -__v");

    return res.status(200).json(new ApiResponse(200,"coverImage updated successfully",user))

});

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {userName} = req.params;

    if(!userName?.trim()) {
        throw new ApiError(400,"user Name is missing");
    };

    const channel = await User.aggregate(
        [
            {
                $match: {
                    userName: userName?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribedCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    subscribersCount: 1,
                    channelSubscribedCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]
    );

    if(!channel?.length) {
        throw new ApiError(404,"channel does not exists");
    }
    console.log("Channel ",channel);
    res.status(200).json(new ApiResponse(200,"success",channel));

});

const getWatchHistory = asyncHandler(async (req,res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
    ]);

    if(!user.length) {
        throw new ApiError(400,"User watch history not found");
    }
    console.log("watch history ",user)
    return res.status(200).json(new ApiResponse(200,"Watch History fetched Successfully",user?.[0]?.watchHistory))

});

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateUserDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory};