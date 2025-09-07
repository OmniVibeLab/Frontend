import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username fullName avatar')
      .populate('originalPost')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new post
router.post("/", async (req, res) => {
  try {
    const { content, image, authorId, authorName, authorUsername, authorAvatar } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    let author;
    let authorIdToUse = authorId;

    // If authorId is provided, get the author from database
    if (authorId) {
      author = await User.findById(authorId);
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      authorIdToUse = authorId;
    } else if (authorUsername) {
      // If no authorId but authorUsername is provided, find user by username
      author = await User.findOne({ username: authorUsername });
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      authorIdToUse = author._id;
    } else {
      return res.status(400).json({ message: "Author information is required" });
    }

    const post = new Post({
      content,
      image,
      author: authorIdToUse,
      authorName: authorName || author.fullName,
      authorUsername: authorUsername || author.username,
      authorAvatar: authorAvatar || author.avatar,
      likes: [],
      reposts: [],
      stores: [],
      comments: []
    });

    await post.save();
    await post.populate('author', 'username fullName avatar');
    
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: err.message });
  }
});

// Like/Unlike a post
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes, likeCount: post.likeCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Repost a post
router.post("/:id/repost", async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already reposted
    const existingRepost = await Post.findOne({
      originalPost: req.params.id,
      author: userId,
      isRepost: true
    });

    if (existingRepost) {
      return res.status(400).json({ message: "Already reposted" });
    }

    // Add to original post's reposts
    if (!originalPost.reposts.includes(userId)) {
      originalPost.reposts.push(userId);
      await originalPost.save();
    }

    // Create repost
    const repost = new Post({
      content: reason || "",
      author: userId,
      authorName: user.fullName,
      authorUsername: user.username,
      authorAvatar: user.avatar,
      isRepost: true,
      originalPost: req.params.id
    });

    await repost.save();
    await repost.populate('author', 'username fullName avatar');
    await repost.populate('originalPost');
    
    res.status(201).json(repost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Store/Unstore a post
router.post("/:id/store", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const storeIndex = post.stores.indexOf(userId);
    if (storeIndex > -1) {
      post.stores.splice(storeIndex, 1);
    } else {
      post.stores.push(userId);
    }

    await post.save();
    res.json({ stores: post.stores, storeCount: post.storeCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar')
      .populate('originalPost')
      .populate('comments');
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;