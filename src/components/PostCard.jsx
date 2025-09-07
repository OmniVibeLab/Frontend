import React, { useState } from 'react';
import { Heart, Repeat2, Bookmark, MessageCircle, Share, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, currentUser, onLike, onRepost, onStore, onComment, onDelete }) => {
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?.id) || false);
  const [isReposted, setIsReposted] = useState(post.reposts?.includes(currentUser?.id) || false);
  const [isStored, setIsStored] = useState(post.stores?.includes(currentUser?.id) || false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostReason, setRepostReason] = useState('');

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        onLike && onLike(post._id, data.likeCount);
      } else {
        toast.error('Failed to like post');
      }
    } catch (error) {
      toast.error('Error liking post');
    }
  };

  const handleRepost = async () => {
    if (!repostReason.trim()) {
      toast.error('Please enter a reason for reposting');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser.id, 
          reason: repostReason 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsReposted(true);
        setShowRepostModal(false);
        setRepostReason('');
        onRepost && onRepost(data);
        toast.success('Post reposted successfully');
      } else {
        toast.error('Failed to repost');
      }
    } catch (error) {
      toast.error('Error reposting');
    }
  };

  const handleStore = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsStored(!isStored);
        onStore && onStore(post._id, data.storeCount);
        toast.success(isStored ? 'Removed from stores' : 'Added to stores');
      } else {
        toast.error('Failed to store post');
      }
    } catch (error) {
      toast.error('Error storing post');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="bg-black border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors">
      {/* Repost Header */}
      {post.isRepost && (
        <div className="flex items-center text-gray-500 text-sm mb-2 ml-8">
          <Repeat2 size={14} className="mr-1" />
          <span>{post.authorName} reposted</span>
        </div>
      )}

      <div className="flex space-x-3">
        {/* Avatar */}
        <img
          src={post.authorAvatar || 'https://via.placeholder.com/40'}
          alt={post.authorName}
          className="w-10 h-10 rounded-full object-cover"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-white text-sm">{post.authorName}</h3>
            <span className="text-gray-500 text-sm">@{post.authorUsername}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatTime(post.createdAt)}</span>
            <div className="ml-auto flex items-center space-x-1">
              {/* Show delete button only for own posts */}
              {onDelete && currentUser && (post.author === currentUser.id || post.authorUsername === currentUser.username) && (
                <button 
                  onClick={() => onDelete(post._id)}
                  className="p-1 rounded-full hover:bg-red-900/20 transition-colors group"
                  title="Delete post"
                >
                  <Trash2 size={16} className="text-gray-500 group-hover:text-red-400" />
                </button>
              )}
              <button className="p-1 rounded-full hover:bg-gray-800 transition-colors">
                <MoreHorizontal size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            {post.isRepost && post.originalPost ? (
              <div>
                <p className="text-white text-sm mb-2">{post.content}</p>
                <div className="border border-gray-700 rounded-lg p-3 bg-gray-900/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={post.originalPost.authorAvatar || 'https://via.placeholder.com/32'}
                      alt={post.originalPost.authorName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-semibold text-white text-sm">{post.originalPost.authorName}</span>
                    <span className="text-gray-500 text-sm">@{post.originalPost.authorUsername}</span>
                  </div>
                  <p className="text-white text-sm">{post.originalPost.content}</p>
                </div>
              </div>
            ) : (
              <p className="text-white text-sm whitespace-pre-wrap">{post.content}</p>
            )}
            
            {/* Image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post image"
                className="mt-3 rounded-lg max-w-full h-auto max-h-96 object-cover"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md">
            {/* Comment */}
            <button
              onClick={() => onComment && onComment(post._id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{post.commentCount || 0}</span>
            </button>

            {/* Repost */}
            <button
              onClick={() => setShowRepostModal(true)}
              className={`flex items-center space-x-2 transition-colors ${
                isReposted ? 'text-green-400' : 'text-gray-500 hover:text-green-400'
              }`}
            >
              <Repeat2 size={18} />
              <span className="text-sm">{post.repostCount || 0}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{post.likeCount || 0}</span>
            </button>

            {/* Store */}
            <button
              onClick={handleStore}
              className={`flex items-center space-x-2 transition-colors ${
                isStored ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
              }`}
            >
              <Bookmark size={18} fill={isStored ? 'currentColor' : 'none'} />
              <span className="text-sm">{post.storeCount || 0}</span>
            </button>

            {/* Share */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 transition-colors">
              <Share size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Repost Modal */}
      {showRepostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Repost</h3>
            <textarea
              value={repostReason}
              onChange={(e) => setRepostReason(e.target.value)}
              placeholder="Add a reason for reposting..."
              className="w-full p-3 bg-gray-800 text-white rounded-lg resize-none mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRepostModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRepost}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Repost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
