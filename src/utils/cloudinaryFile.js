import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


const uploadOnCloudinary = async (localFilePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log("process.env.CLOUDINARY_CLOUD_NAME",process.env.CLOUDINARY_CLOUD_NAME);
    console.log("process.env.CLOUDINARY_API_KEY",process.env.CLOUDINARY_API_KEY);
    console.log("process.env.CLOUDINARY_API_SECRET",process.env.CLOUDINARY_API_SECRET)
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        );
        console.log("response ",response);
        console.log(`File (${localFilePath} ) uploaded on cloudinary`);
        fs.unlinkSync(localFilePath);
        return response;
    } catch(error) {
        console.log(error)
        fs.unlinkSync(localFilePath); // remove local save file temp 
        return null;
    }
}


const destroyFromCloudinary = async (secure_url) => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log("process.env.CLOUDINARY_CLOUD_NAME",process.env.CLOUDINARY_CLOUD_NAME);
    console.log("process.env.CLOUDINARY_API_KEY",process.env.CLOUDINARY_API_KEY);
    console.log("process.env.CLOUDINARY_API_SECRET",process.env.CLOUDINARY_API_SECRET)
    try {
        if(!secure_url) return null;
        const response = await cloudinary.uploader.upload(
            secure_url,
            {
                resource_type: "auto"
            }
        );
        console.log("response ",response);
        console.log(`File (${secure_url} ) destroyed from cloudinary`);
        return response;
    } catch(error) {
        console.log(error);
        return null;
    }
}
export {uploadOnCloudinary,destroyFromCloudinary};
