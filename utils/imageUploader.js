const cloudinary = require("cloudinary").v2;

const uploadImageToCloudinary = async (file, folder, height, quality = 80) => {
  try {
    const options = {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      quality,
      resource_type: "auto",
    };

    if (height) {
      options.height = height;
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    throw error;
  }
};

// 👇 This line is the key fix
module.exports = { uploadImageToCloudinary };
