import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, Edit, MoreHorizontal, Trash2, UserPlus, UserMinus, Users, MessageCircle } from 'lucide-react';
import authService from '../services/authService';
import EditProfile from '../components/EditProfile';
import DeleteConfirmation from '../components/DeleteConfirmation';
import FollowModal from '../components/FollowModal';
import MessageBox from '../components/MessageBox';
import PostCard from '../components/PostCard';
import { testServerConnection, testDeleteEndpoint } from '../utils/serverTest';

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null); // user being viewed
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers');
  const [currentUser, setCurrentUser] = useState(null);

  // Function to fetch user posts (moved outside useEffect so it can be called from event listener)
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/posts?username=${username}`);
      const data = await res.json();
      // Ensure data is always an array
      setUserPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setUserPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user from backend by username
        const res = await fetch(`http://localhost:5000/api/users/${username}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setProfileUser(data);
        setFollowersCount(data.followers?.length || 0);
        setFollowingCount(data.following?.length || 0);

        // Check if it's own profile
        const currentUserData = authService.getCurrentUser();
        setCurrentUser(currentUserData);
        setIsOwnProfile(
          currentUserData &&
          (currentUserData.username === username ||
            currentUserData.email?.split('@')[0] === username)
        );

        // Check following status if not own profile
        if (currentUserData && !isOwnProfile && data.id) {
          const followRes = await fetch(`http://localhost:5000/api/follow/${currentUserData.id}/is-following/${data.id}`);
          if (followRes.ok) {
            const followData = await followRes.json();
            setIsFollowing(followData.isFollowing);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchUserProfile();
    fetchUserPosts();
  }, [username]);

  // Listen for post creation events to refresh posts when user creates a new post
  useEffect(() => {
    const handlePostCreated = (event) => {
      const newPost = event.detail;
      console.log("Profile: Post created event received:", newPost);
      console.log("Profile: Current state:", { isOwnProfile, username, newPostAuthor: newPost.authorUsername });
      
      // Only refresh if it's the current user's profile and the post belongs to them
      if (isOwnProfile && newPost.authorUsername === username) {
        console.log("Profile: Refreshing posts for own profile");
        fetchUserPosts();
      } else {
        console.log("Profile: Not refreshing - conditions not met");
      }
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, [username, isOwnProfile]);

  const handleProfileUpdated = (updatedUser) => {
    setProfileUser(updatedUser);
  };

  const handleDeleteRequest = (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
    setShowDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    try {
      const deleteUrl = `http://localhost:5000/api/posts/${postToDelete}`;
      const res = await fetch(deleteUrl, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");

      setUserPosts((prev) => prev.filter((post) => post._id !== postToDelete));
      alert("Post deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(`Error deleting post: ${err.message}`);
    } finally {
      setPostToDelete(null);
    }
  };

  const toggleDropdown = (postId) => {
    setShowDropdown(showDropdown === postId ? null : postId);
  };

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`http://localhost:5000/api/follow/${profileUser.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id })
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleFollowModal = (type) => {
    setFollowModalType(type);
    setShowFollowModal(true);
  };

  const handleMessageFromProfile = () => {
    // Navigate to messages page with user pre-selected
    navigate('/messages');
    
    // Set the user to be pre-selected in the message input
    setTimeout(() => {
      if (window.handleMessageFromProfile) {
        window.handleMessageFromProfile(profileUser);
      }
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!profileUser || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden mb-4">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <img
              src={profileUser.avatar || "https://via.placeholder.com/128"}
              alt={profileUser.fullName || profileUser.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-900 bg-gray-900"
            />
            <div className="ml-auto mb-4 flex space-x-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center transition-colors"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleMessageFromProfile}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center transition-colors"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Message
                  </button>
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                      isFollowing
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={16} className="mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        Follow
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {profileUser.fullName || profileUser.email?.split('@')[0]}
            </h1>
            <p className="text-gray-400">@{profileUser.username}</p>
          </div>

          {profileUser.bio && <p className="text-gray-300 mb-4">{profileUser.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            {profileUser.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {profileUser.location}
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center">
                <LinkIcon size={16} className="mr-1" />
                <a
                  href={profileUser.website}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profileUser.website}
                </a>
              </div>
            )}
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              Joined {new Date(profileUser.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <button
              onClick={() => handleFollowModal('posts')}
              className="hover:text-blue-400 transition-colors"
            >
              <span className="font-bold text-white">{userPosts.length}</span>
              <span className="text-gray-400 ml-1">Posts</span>
            </button>
            <button
              onClick={() => handleFollowModal('following')}
              className="hover:text-blue-400 transition-colors"
            >
              <span className="font-bold text-white">{followingCount}</span>
              <span className="text-gray-400 ml-1">Following</span>
            </button>
            <button
              onClick={() => handleFollowModal('followers')}
              className="hover:text-blue-400 transition-colors"
            >
              <span className="font-bold text-white">{followersCount}</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-gray-900 rounded-lg shadow-md">
        <div className="border-b border-gray-700">
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Posts</h2>
            <button 
              onClick={fetchUserPosts}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div>
          {!Array.isArray(userPosts) || userPosts.length === 0 ? (
            <div className="px-4 sm:px-6 py-12 text-center text-gray-400">
              <p>No posts yet.</p>
              {isOwnProfile && (
                <p className="mt-2">Share your first post to get started!</p>
              )}
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onLike={(postId, likeCount) => {
                  setUserPosts(prev => Array.isArray(prev) ? prev.map(p => 
                    p._id === postId ? { ...p, likeCount } : p
                  ) : []);
                }}
                onRepost={(repostData) => {
                  // Handle repost if needed
                }}
                onStore={(postId, storeCount) => {
                  setUserPosts(prev => Array.isArray(prev) ? prev.map(p => 
                    p._id === postId ? { ...p, storeCount } : p
                  ) : []);
                }}
                onComment={(postId) => {
                  // Handle comment if needed
                }}
                onDelete={isOwnProfile ? handleDeleteRequest : undefined}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={profileUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone and the post will be permanently removed from your profile."
      />

      {/* Follow Modal */}
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={profileUser?.id}
        type={followModalType}
        currentUser={currentUser}
      />

    </div>
  );
}

export default Profile;
