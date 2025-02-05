const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary"); // Import Cloudinary config
const { createPost, getAllPosts, getPostById, likePost, addComment, deletePost } = require("../controllers/apiController");

// Upload tweet with image
router.post("/upload-tweet", upload.single("image"), createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id/like", likePost);
router.post("/posts/:id/comment", addComment);
router.delete("/posts/:id", deletePost);

module.exports = router;
