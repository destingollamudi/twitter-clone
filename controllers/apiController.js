const Post = require("../models/Tweet");

/* 🔹 CREATE A POST */
exports.createPost = async (req, res) => {
  try {
    const { username, tweet } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = new Post({ username, content: tweet, imageUrl });
    await newPost.save();

    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

/* 🔹 GET ALL POSTS */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
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
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes += 1;
    await post.save();

    res.json({ likes: post.likes });
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
