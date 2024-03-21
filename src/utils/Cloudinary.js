import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with your account credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    // Log the uploaded file details
    console.log("File uploaded on Cloudinary:", response);

    // Remove the locally saved temporary file
    // fs.unlinkSync(localFilePath);
    fs.unlinkSync(localFilePath);

    return response; // Return the response containing the file details
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Remove the locally saved temporary file as the upload operation failed
    fs.unlinkSync(localFilePath);

    return null;
  }
};

export { uploadOnCloudinary };