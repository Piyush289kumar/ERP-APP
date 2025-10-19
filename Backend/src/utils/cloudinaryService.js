import cloudinary from "../config/cloudinary.js";
import fs from "node:fs";

/*
    Upload file to cloudinary
*/

export const uploadToCloudinary = async (
  filePath,
  folder = process.env.CLOUDINARY_FOLDER
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // auto-detect image/video/pdf
      transformation: [{ quality: "auto", fetch_format: "auto" }], // optimize
    });

    // Auto Delete temp file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Failed to delete temp file:", err.message);
      });
    }

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    // Ensure even failed uploads clean temp files
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Failed to delete temp file:", err.message);
      });
    }
    throw new Error("Image upload failed.");
  }
};

// Delete file from Cloudinary using public_id
export const destroyFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    throw new Error("Image delete failed.");
  }
};
