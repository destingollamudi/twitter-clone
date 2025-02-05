const Post = require("../models/tweet");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    let mediaUrl = null;
    let mediaType = null;
    
    if (req.file) {
      mediaUrl = req.file.path; // Cloudinary provides a secure URL
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    const newPost = new Post({
      content,
      media: mediaUrl, // Store media URL (image or video)
      mediaType, // Store media type
      createdAt: new Date(),
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* 🔹 GET ALL POSTS */
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Show newest tweets first
      .skip(skip)
      .limit(limit);

    res.json({ posts, totalPages });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* 🔹 GET SINGLE POST */
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

/* 🔹 LIKE A POST */
exports.likePost = async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json({ likes: result.likes });
  } catch (error) {
    console.error("Error updating like count:", error);
    res.status(500).json({ error: "Failed to update like count" });
  }
};


/* 🔹 ADD A COMMENT */
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const { username, content, profilePic } = req.body;
    post.comments.push({ username, content, profilePic });
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// 🔹 DELETE A POST
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

