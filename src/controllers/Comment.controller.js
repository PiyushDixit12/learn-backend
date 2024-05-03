import {isValidObjectId} from "mongoose"
import {Comment} from "../models/Comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/Video.model.js"

const getVideoComments = asyncHandler(async (req,res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1,limit = 10} = req.query;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"Please Provide a valid videoId");
    }

    const filterData = await Comment.find({video: videoId});

    const startIndex = (page - 1) * limit;
    const endIndex = (page) * limit;
    const paginationData = filterData.slice(startIndex,endIndex);
    const totalPages = Math.ceil(filterData.length / limit);

    return res.status(200).json(new ApiResponse(200,"comments fetch successfully",{
        comments: paginationData,
        totalPages,
        totalItems: paginationData.length,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? parseInt(page) - 1 : null
    }));

});

const addComment = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    const {content} = req.body;
    // TODO: add a comment to a video
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"Please Provide a valid videoId");
    }

    if(!content) {
        throw new ApiError(400,"Please Provide a required fields");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(500,"Can'nt find video with videoId " + videoId);
    }

    const comment = await Comment.create({
        owner: req?.user?._id,
        video: video?._id,
        content
    });

    if(!comment) {
        throw new ApiError(500,"Error while adding comment on video ");
    }

    return res.status(200).json(new ApiResponse(201,"Comment added successfully",comment));

});

const updateComment = asyncHandler(async (req,res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;
    if(!content) {
        throw new ApiError(400,"please provide a required fields");
    }

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400,"please provide a valid commentId");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        });

    if(!comment) {
        throw new ApiError(500,"Error while updating comment ");
    }

    return res.status(200).json(new ApiResponse(200,"comment updated successfully",comment));

});

const deleteComment = asyncHandler(async (req,res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400,"please provide a valid commentId");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if(!comment) {
        throw new ApiError(500,"Error while deleting comment ");
    }

    return res.status(200).json(new ApiResponse(200,"comment deleted successfully",comment));

});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}