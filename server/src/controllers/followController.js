import User from '../models/User.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id || req.body.followerId;
    
    if (!followerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (userId === followerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const user = await User.findById(userId);
    const follower = await User.findById(followerId);
    
    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already following
    if (user.followers.includes(followerId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Add to followers and following
    user.followers.push(followerId);
    follower.following.push(userId);
    
    await user.save();
    await follower.save();
    
    res.json({ 
      message: 'Successfully followed user',
      followersCount: user.followers.length,
      followingCount: follower.following.length
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id || req.body.followerId;
    
    if (!followerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const user = await User.findById(userId);
    const follower = await User.findById(followerId);
    
    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove from followers and following
    user.followers = user.followers.filter(id => id.toString() !== followerId);
    follower.following = follower.following.filter(id => id.toString() !== userId);
    
    await user.save();
    await follower.save();
    
    res.json({ 
      message: 'Successfully unfollowed user',
      followersCount: user.followers.length,
      followingCount: follower.following.length
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('followers', 'username fullName avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('following', 'username fullName avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if following
export const isFollowing = async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    
    if (!targetUserId || targetUserId === 'undefined') {
      return res.status(400).json({ message: 'Invalid target user ID' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFollowing = user.following.includes(targetUserId);
    
    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
