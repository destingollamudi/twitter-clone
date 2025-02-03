const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  profilePic: { type: String, required: true }, // Randomized PFP
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  content: { type: String, trim: true, maxlength: 280 },
  imageUrl: { type: String, default: null },
  likes: { type: Number, default: 0 },
  comments: [CommentSchema], // Embedded comments
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
