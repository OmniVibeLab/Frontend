import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Users, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FollowModal = ({ isOpen, onClose, userId, type, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const response = await fetch(`http://localhost:5000/api/follow/${userId}/${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Check following status for each user
        const statusPromises = data.map(user => 
          checkFollowingStatus(user._id)
        );
        const statuses = await Promise.all(statusPromises);
        
        const statusMap = {};
        data.forEach((user, index) => {
          statusMap[user._id] = statuses[index];
        });
        setFollowingStatus(statusMap);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowingStatus = async (targetUserId) => {
    try {
      if (!targetUserId || !currentUser?.id) {
        return false;
      }
      const response = await fetch(`http://localhost:5000/api/follow/${currentUser.id}/is-following/${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        return data.isFollowing;
      }
    } catch (error) {
      console.error('Error checking following status:', error);
    }
    return false;
  };

  const handleFollow = async (targetUserId) => {
    try {
      const isCurrentlyFollowing = followingStatus[targetUserId];
      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch(`http://localhost:5000/api/follow/${targetUserId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id })
      });

      if (response.ok) {
        setFollowingStatus(prev => ({
          ...prev,
          [targetUserId]: !isCurrentlyFollowing
        }));
        toast.success(isCurrentlyFollowing ? 'Unfollowed successfully' : 'Followed successfully');
      } else {
        toast.error('Failed to update follow status');
      }
    } catch (error) {
      toast.error('Error updating follow status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {type === 'followers' ? (
              <Users size={20} className="text-white" />
            ) : (
              <UserCheck size={20} className="text-white" />
            )}
            <h2 className="text-white font-semibold text-lg capitalize">{type}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-400">No {type} found</p>
            </div>
          ) : (
            <div className="p-2">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar || 'https://via.placeholder.com/48'}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-sm">{user.fullName}</h3>
                      <p className="text-gray-400 text-xs">@{user.username}</p>
                      {user.bio && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{user.bio}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Joined {formatDate(user.joinedDate || user.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {user._id !== currentUser.id && (
                    <button
                      onClick={() => handleFollow(user._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        followingStatus[user._id]
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {followingStatus[user._id] ? (
                        <div className="flex items-center space-x-1">
                          <UserMinus size={14} />
                          <span>Unfollow</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <UserPlus size={14} />
                          <span>Follow</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
