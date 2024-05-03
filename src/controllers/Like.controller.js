import mongoose,{isValidObjectId} from "mongoose"
import {Like} from "../models/Like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"Please provide a valid videoId");
    }
    const like = await Like.findOne({video: videoId,likedBy: req?.user?._id});

    if(!like) {
        const likeCreate = await Like.create({video: videoId,likedBy: req?.user?._id});
        return res.status(200).json(new ApiResponse(200,"video liked successfully ",likeCreate));
    }

    const likedDelete = await Like.findOneAndDelete({video: videoId,likedBy: req?.user?._id});

    return res.status(200).json(new ApiResponse(200,"video un liked successfully",likedDelete))

});

const toggleCommentLike = asyncHandler(async (req,res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400,"Please provide a valid commentId");
    }
    const like = await Like.findOne({comment: commentId,likedBy: req?.user?._id});

    if(!like) {
        const likeCreate = await Like.create({comment: commentId,likedBy: req?.user?._id});
        return res.status(200).json(new ApiResponse(200,"comment liked successfully ",likeCreate));
    }

    const likedDelete = await Like.findOneAndDelete({comment: commentId,likedBy: req?.user?._id});

    return res.status(200).json(new ApiResponse(200,"comment un liked successfully",likedDelete));
});

const toggleTweetLike = asyncHandler(async (req,res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Please provide a valid tweetId");
    }
    const like = await Like.findOne({tweet: tweetId,likedBy: req?.user?._id});

    if(!like) {
        const likeCreate = await Like.create({tweet: tweetId,likedBy: req?.user?._id});
        return res.status(200).json(new ApiResponse(200,"tweet liked successfully ",likeCreate));
    }

    const likedDelete = await Like.findOneAndDelete({tweet: tweetId,likedBy: req?.user?._id});

    return res.status(200).json(new ApiResponse(200,"tweet un liked successfully",likedDelete));
}
);

const getLikedVideos = asyncHandler(async (req,res) => {
    //TODO: get all liked videos

    // const likedVideos = await Like.find({likedBy: req?.user?._id});
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id
            }
        },
        {
            $lookup: {
                from: "videos",
                "foreignField": "_id",
                "localField": "video",
                as: "video",
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
                                        userName: 1,
                                        avatar: 1,
                                        email: 1
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            duration: 1,
                            thumbNail: 1,
                            views: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },
        {
            $sort: {
                updatedAt: -1
            }
        }
    ]);

    if(!likedVideos?.length) {
        return res.status(200).json(new ApiResponse(200,"No liked videos found",likedVideos));
    }

    res.status(200).json(new ApiResponse(200,"liked video fetch successfully",likedVideos));

});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};