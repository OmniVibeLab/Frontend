import React, { useState, useEffect } from "react";
import { Compass, TrendingUp, Users, Hash, Search, UserPlus, Heart, MessageCircle, Repeat2 } from "lucide-react";
import authService from "../services/authService";

export default function Explore() {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trending topics (hashtags from posts)
      const topicsRes = await fetch("http://localhost:5000/api/posts");
      if (topicsRes.ok) {
        const posts = await topicsRes.json();
        const hashtags = extractHashtags(posts);
        setTrendingTopics(hashtags);
        setPopularPosts(posts.slice(0, 5)); // Get top 5 posts
      }

      // Fetch suggested users (users with most followers)
      const usersRes = await fetch("http://localhost:5000/api/users");
      if (usersRes.ok) {
        const users = await usersRes.json();
        setSuggestedUsers(users.slice(0, 5)); // Get top 5 users
      }
    } catch (err) {
      console.error("Failed to fetch explore data:", err);
    }
    setLoading(false);
  };

  const extractHashtags = (posts) => {
    const hashtagCount = {};
    posts.forEach(post => {
      const hashtags = post.content.match(/#\w+/g);
      if (hashtags) {
        hashtags.forEach(tag => {
          hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(hashtagCount)
      .map(([tag, count]) => ({ tag, posts: count }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 10);
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/follow/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id })
      });
      
      if (response.ok) {
        // Update the suggested users list
        setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-black min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-black min-h-screen space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <Compass size={24} className="text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">Explore</h1>
        </div>
        <p className="text-gray-300">Discover trending topics and connect with new people</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts, users, or hashtags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <TrendingUp size={20} className="text-green-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Trending Topics</h2>
          </div>
          <div className="space-y-3">
            {trendingTopics.length ? trendingTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <Hash size={16} className="text-blue-400 mr-2" />
                  <div>
                    <p className="font-medium text-white">{topic.tag}</p>
                    <p className="text-sm text-gray-400">{topic.posts} posts</p>
                  </div>
                </div>
              </div>
            )) : <p className="text-gray-400">No trending topics</p>}
          </div>
        </div>

        {/* Suggested Users */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Users size={20} className="text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Suggested Users</h2>
          </div>
          <div className="space-y-3">
            {suggestedUsers.length ? suggestedUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt={user.fullName || user.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-white">{user.fullName || user.username}</p>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(user.id)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
                >
                  <UserPlus size={14} className="mr-1" />
                  Follow
                </button>
              </div>
            )) : <p className="text-gray-400">No suggested users</p>}
          </div>
        </div>
      </div>

      {/* Popular Posts */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Popular Posts</h2>
        {popularPosts.length ? (
          <div className="space-y-4">
            {popularPosts.map((post, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-start space-x-3">
                  <img
                    src={post.author?.avatar || "https://via.placeholder.com/40"}
                    alt={post.author?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white">{post.author?.fullName || post.author?.username}</h3>
                      <span className="text-gray-400 text-sm">@{post.author?.username}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{post.content}</p>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{post.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={14} />
                        <span>{post.commentCount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Repeat2 size={14} />
                        <span>{post.repostCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Compass size={48} className="mx-auto mb-4 text-gray-600" />
            <p>No popular posts available</p>
          </div>
        )}
      </div>
    </div>
  );
}
