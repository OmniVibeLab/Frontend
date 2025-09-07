import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Follow a user
router.post("/:userId/follow", async (req, res) => {
  try {
    const { followerId } = req.body;
    const { userId } = req.params;

    if (followerId === userId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const follower = await User.findById(followerId);

    if (!user || !follower) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (user.followers.includes(followerId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add follower to user's followers list
    user.followers.push(followerId);
    await user.save();

    // Add user to follower's following list
    follower.following.push(userId);
    await follower.save();

    res.json({ 
      message: "Successfully followed user",
      followers: user.followers,
      following: follower.following
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow a user
router.post("/:userId/unfollow", async (req, res) => {
  try {
    const { followerId } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    const follower = await User.findById(followerId);

    if (!user || !follower) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove follower from user's followers list
    const followerIndex = user.followers.indexOf(followerId);
    if (followerIndex > -1) {
      user.followers.splice(followerIndex, 1);
      await user.save();
    }

    // Remove user from follower's following list
    const followingIndex = follower.following.indexOf(userId);
    if (followingIndex > -1) {
      follower.following.splice(followingIndex, 1);
      await follower.save();
    }

    res.json({ 
      message: "Successfully unfollowed user",
      followers: user.followers,
      following: follower.following
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get followers list
router.get("/:userId/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username fullName avatar bio');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get following list
router.get("/:userId/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username fullName avatar bio');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if user is following another user
router.get("/:userId/is-following/:targetUserId", async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.following.includes(targetUserId);
    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
