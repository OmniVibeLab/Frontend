// src/components/Feed.jsx
import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";

const Feed = ({ user, refreshTrigger }) => {
  const [posts, setPosts] = useState([]);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Fetched posts:", data); // Debug log
      setPosts(Array.isArray(data) ? data : []); // Don't reverse, server already sorts by newest first
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  const handleLike = (postId, likeCount) => {
    setPosts((prev) =>
      Array.isArray(prev) ? prev.map((post) =>
        post._id === postId
          ? { ...post, likeCount }
          : post
      ) : []
    );
  };

  const handleRepost = (repostData) => {
    // Add the repost to the beginning of the feed
    setPosts((prev) => Array.isArray(prev) ? [repostData, ...prev] : [repostData]);
  };

  const handleStore = (postId, storeCount) => {
    setPosts((prev) =>
      Array.isArray(prev) ? prev.map((post) =>
        post._id === postId
          ? { ...post, storeCount }
          : post
      ) : []
    );
  };

  const handleComment = (postId) => {
    // Handle comment functionality if needed
    console.log('Comment on post:', postId);
  };

  
  return (
    <div className="space-y-0">
      {/* Posts Feed */}
      {!Array.isArray(posts) || posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No posts yet...</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={user}
            onLike={handleLike}
            onRepost={handleRepost}
            onStore={handleStore}
            onComment={handleComment}
          />
        ))
      )}
    </div>
  );
};

export default Feed;
