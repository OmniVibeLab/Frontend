// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  authorName: { type: String },
  authorUsername: { type: String },
  authorAvatar: { type: String },
  image: { type: String },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  reposts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  stores: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
  isRepost: { type: Boolean, default: false },
  originalPost: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post' 
  },
  repostReason: { type: String }
}, { timestamps: true });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for repost count
postSchema.virtual('repostCount').get(function() {
  return this.reposts ? this.reposts.length : 0;
});

// Virtual for store count
postSchema.virtual('storeCount').get(function() {
  return this.stores ? this.stores.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Post", postSchema);
  