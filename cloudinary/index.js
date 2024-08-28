const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'PropertyRentalApp',
    allowedFormats: ['jpeg', 'png', 'jpg', 'gif']
  }
});

// Function to upload a file to Cloudinary
const uploadFileToCloudinary = async (filePath) => {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  try {
    console.log(process.env.CLOUDINARY_API_KEY);
    console.log(process.env.CLOUDINARY_API_SECRET);
    console.log(process.env.CLOUDINARY_CLOUD_NAME);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'PropertyRentalApp',
      allowed_formats: ['jpeg', 'png', 'jpg', 'gif']
    });
    return result; // Return the entire result object
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error; // Re-throw the error to be caught in the calling function
  }
};



module.exports = { cloudinary, storage, uploadFileToCloudinary }