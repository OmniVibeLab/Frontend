import Post from '../models/Post.js';
import User from '../models/User.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, authorName, authorUsername, authorAvatar, image } = req.body;
    
    // Get user ID from the request (you'll need to implement auth middleware)
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const post = new Post({
      content,
      author: userId,
      authorName,
      authorUsername,
      authorAvatar,
      image,
      likes: [],
      reposts: [],
      stores: [],
      comments: []
    });

    const savedPost = await post.save();
    await savedPost.populate('author', 'username fullName avatar');
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar')
      .populate('comments');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post (you'll need to implement auth middleware)
    const userId = req.user?.id || req.body.userId;
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    const userId = req.user?.id || req.body.userId;
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content, image },
      { new: true }
    ).populate('author', 'username fullName avatar');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/Unlike post
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    res.json({ 
      message: isLiked ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length 
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Repost post
export const repostPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    const { reason } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already reposted
    const existingRepost = await Post.findOne({
      originalPost: postId,
      author: userId,
      isRepost: true
    });
    
    if (existingRepost) {
      return res.status(400).json({ message: 'Post already reposted' });
    }
    
    const repost = new Post({
      content: reason || '',
      author: userId,
      authorName: originalPost.authorName,
      authorUsername: originalPost.authorUsername,
      authorAvatar: originalPost.authorAvatar,
      isRepost: true,
      originalPost: postId,
      repostReason: reason
    });
    
    const savedRepost = await repost.save();
    await savedRepost.populate('author', 'username fullName avatar');
    
    res.status(201).json(savedRepost);
  } catch (error) {
    console.error('Error reposting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Store/Save post
export const storePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const isStored = post.stores.includes(userId);
    
    if (isStored) {
      post.stores = post.stores.filter(id => id.toString() !== userId);
    } else {
      post.stores.push(userId);
    }
    
    await post.save();
    res.json({ 
      message: isStored ? 'Post removed from stores' : 'Post stored',
      storeCount: post.stores.length 
    });
  } catch (error) {
    console.error('Error storing post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // For now, we'll just add a simple comment object
    // In a real app, you'd have a separate Comment model
    const comment = {
      content,
      author: userId,
      createdAt: new Date()
    };
    
    post.comments.push(comment);
    await post.save();
    
    res.status(201).json({ message: 'Comment added', commentCount: post.comments.length });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments
export const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
