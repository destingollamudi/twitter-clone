const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tweets", // Folder name in Cloudinary
    format: async (req, file) => "jpg", // Convert all uploads to JPG
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

// Multer Middleware for Image Uploads
const upload = multer({ storage });

module.exports = { cloudinary, upload };
