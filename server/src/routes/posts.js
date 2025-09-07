import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    message: "Server is working!", 
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/test",
      "POST /api/register", 
      "POST /api/login",
      "GET /api/posts",
      "POST /api/posts",
      "DELETE /api/posts/:id"
    ]
  });
});

// Get all posts (Feed)
router.get("/", async (req, res) => {
  try {
    console.log("📖 Fetching all posts");
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${posts.length} posts`);
    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ 
      message: "Error fetching posts",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Create a post
router.post("/", async (req, res) => {
  try {
    const { content, authorName, authorUsername, authorAvatar } = req.body;
    
    console.log("📝 Creating new post:", { 
      content: content?.substring(0, 50) + "...", 
      authorUsername 
    });
    
    if (!content || !content.trim()) {
      console.log("❌ Empty content");
      return res.status(400).json({ message: "Post content is required" });
    }

    if (!authorUsername) {
      console.log("❌ Missing author username");
      return res.status(400).json({ message: "Author username is required" });
    }

    const newPost = await Post.create({
      content: content.trim(),
      authorName: authorName?.trim() || authorUsername,
      authorUsername: authorUsername.trim(),
      authorAvatar: authorAvatar || null,
      likes: 0,
      reposts: 0,
      createdAt: new Date()
    });

    console.log("✅ Post created successfully:", newPost._id);
    res.status(201).json(newPost);

  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ 
      message: "Error creating post",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete request for post ID: ${id}`);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`❌ Invalid ObjectId format: ${id}`);
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    const deletedPost = await Post.findByIdAndDelete(id);
    
    if (!deletedPost) {
      console.log(`❌ Post not found with ID: ${id}`);
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log(`✅ Post deleted successfully: ${id}`);
    res.json({ 
      message: "Post deleted successfully", 
      deletedPost: {
        id: deletedPost._id,
        content: deletedPost.content.substring(0, 50) + "...",
        authorUsername: deletedPost.authorUsername
      }
    });

  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({ 
      message: "Error deleting post", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update post (like/unlike, repost)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like', 'unlike', 'repost', 'unrepost'
    
    console.log(`🔄 Update request for post ID: ${id}, action: ${action}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    switch (action) {
      case 'like':
        post.likes = (post.likes || 0) + 1;
        break;
      case 'unlike':
        post.likes = Math.max((post.likes || 0) - 1, 0);
        break;
      case 'repost':
        post.reposts = (post.reposts || 0) + 1;
        break;
      case 'unrepost':
        post.reposts = Math.max((post.reposts || 0) - 1, 0);
        break;
      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    await post.save();
    console.log(`✅ Post updated successfully: ${id}`);
    res.json(post);

  } catch (err) {
    console.error("❌ Error updating post:", err);
    res.status(500).json({ 
      message: "Error updating post", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;