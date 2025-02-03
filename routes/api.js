const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createPost, getAllPosts, likePost, getPostById, addComment, deletePost } = require("../controllers/apiController");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/upload-tweet", upload.single("image"), createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById); // Get a single tweet
router.put("/posts/:id/like", likePost);
router.post("/posts/:id/comment", addComment); // Add comment
router.delete('/posts/:id', deletePost);

module.exports = router;
