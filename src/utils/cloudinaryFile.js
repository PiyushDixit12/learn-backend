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
export {uploadOnCloudinary};