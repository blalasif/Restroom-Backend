import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(
            new Error(`Failed to upload image to Cloudinary: ${error.message}`)
          );
        }
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Cloudinary delete error:", error);
        return reject(new Error("Failed to delete image from Cloudinary"));
      }
      console.log("Cloudinary delete result:", result);
      resolve(result);
    });
  });
};
