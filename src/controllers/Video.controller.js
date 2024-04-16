import {Types,isValidObjectId} from "mongoose"
import {Video} from "../models/Video.model.js"
import {User} from "../models/User.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinaryFile.js"


const getAllVideos = asyncHandler(async (req,res) => {
    const {page = 1,limit = 10,query,sortBy,sortType,userId} = req.query;
    //TODO: get all videos based on query, sort, pagination
    let filterData = [];
    console.log("UserId is ",userId);
    if(isValidObjectId(userId)) {
        filterData = await Video.find({owner: new Types.ObjectId(userId)}).select("-__v");
    } else {
        filterData = await Video.find().select("-__v");
    }

    if(sortBy && sortType) {
        filterData.sort((a,b) => {
            if(sortType?.toLowerCase() === 'asc') {
                return a[sortType] > b[sortType] ? 1 : -1
            }
            if(sortType?.toLowerCase() === 'desc') {
                return a[sortType] < b[sortType] ? 1 : -1
            }
        });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = (page) * limit;
    const paginationData = filterData.slice(startIndex,endIndex);
    const totalPages = Math.ceil(filterData.length / limit);

    return res.status(200).json(
        new ApiResponse(200,
            "Video fetch successfully"
            ,{
                videos: paginationData,
                totalPages,
                totalItems: paginationData.length,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? parseInt(page) - 1 : null
            }));

})

const publishAVideo = asyncHandler(async (req,res) => {
    const {title,description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if([title,description,req?.user].some(value => {
        return value == "" || value == null;
    })) {
        throw new ApiError(400,"fields are required ");
    }
    const thumbNailLocalPath = req.files?.thumbNail?.[0]?.path;
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;

    if(!thumbNailLocalPath || !videoFileLocalPath) {
        throw new ApiError(400,"Thumbnail and videoFile is required ");
    };

    const thumbNail = await uploadOnCloudinary(thumbNailLocalPath);
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);

    if(!thumbNail.secure_url || !videoFile.secure_url || !videoFile.duration) {
        throw new ApiError(500,"Error occur while uploading thumbNail and videoFile on Cloudinary");
    };

    console.log("Video file is ",videoFile.secure_url);
    console.log("Video duration is ",videoFile.duration);

    const video = await Video.create(
        {
            title,
            description,
            videoFile: videoFile.secure_url,
            thumbNail: thumbNail.secure_url,
            duration: videoFile.duration,
            owner: req.user?._id
        }
    );

    if(!video) {
        throw new ApiError(500,"Video Not publish Successfully");
    }

    return res.status(200).json(new ApiResponse(200,"Video publish Successfully",video))

})

const getVideoById = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    //TODO: get video by id
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"videoId is required");
    }

    const video = await Video.findById(videoId).select("-__v");

    if(!video) {
        throw new ApiError(500,"No video found with videoId " + videoId);
    }

    res.status(200).json(new ApiResponse(200,"Video fetch successfully",video));
})

// remain to check or test
const updateVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    const {title,description} = req.body;
    const thumbNailLocalPath = req?.file?.path;
    console.log("thumbnail local path",thumbNailLocalPath)
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"please provide a valid video id ");
    }
    let video = await Video.findById(videoId).select("-__v");
    console.log("Video ",video);
    if(!video) {
        throw new ApiError(500,"Can'nt fetch video with video id " + videoId);
    }

    if(thumbNailLocalPath) {
        const thumbNail = await uploadOnCloudinary(thumbNailLocalPath);
        console.log("thumb nail ",thumbNail);
        if(!thumbNail?.secure_url) {
            throw new ApiError(500,"Error while uploading thumbnail ");
        }

        video.thumbNail = thumbNail.secure_url;
    }

    if(title) {
        video.title = title;
    }

    if(description) {
        video.description = description;
    }

    await video.save({validateBeforeSave: false});
    return res.status(200).json(new ApiResponse(200,"Video updated successfully",video));
});

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"please provide a valid video id ");
    }

    const video = await Video.findByIdAndDelete(videoId).select("-__v");

    if(!video) {
        throw new ApiError(500,"Video not found with video id " + videoId);
    }

    return res.status(200).json(new ApiResponse(200,"Video deleted successfully",video));

})

const togglePublishStatus = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    const {isPublished} = req.body;

    if(!videoId || isPublished === "" || isPublished == null) {
        throw new ApiError(400,"videoId and status isPublished is required");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !isPublished
            },
        },
        {new: true}
    ).select("-__v");

    if(!video) {
        throw new ApiError(500,"No video found with videoId " + videoId);
    }

    res.status(200).json(new ApiResponse(200,"Video Updated successfully",video));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}