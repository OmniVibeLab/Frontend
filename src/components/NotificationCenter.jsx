import React, { useState, useEffect } from 'react';
import { Bell, Heart, Repeat2, MessageCircle, UserPlus, X, Check } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchNotifications();
    }
  }, [isOpen, currentUser]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Simulate fetching notifications
      const mockNotifications = [
        {
          id: 1,
          type: 'like',
          user: {
            name: 'John Doe',
            username: 'johndoe',
            avatar: 'https://via.placeholder.com/40'
          },
          post: {
            id: '1',
            content: 'Just posted something amazing!'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false
        },
        {
          id: 2,
          type: 'follow',
          user: {
            name: 'Jane Smith',
            username: 'janesmith',
            avatar: 'https://via.placeholder.com/40'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false
        },
        {
          id: 3,
          type: 'repost',
          user: {
            name: 'Mike Johnson',
            username: 'mikej',
            avatar: 'https://via.placeholder.com/40'
          },
          post: {
            id: '2',
            content: 'This is a great post!'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          read: true
        },
        {
          id: 4,
          type: 'comment',
          user: {
            name: 'Sarah Wilson',
            username: 'sarahw',
            avatar: 'https://via.placeholder.com/40'
          },
          post: {
            id: '3',
            content: 'Amazing work!'
          },
          comment: 'Great post! Keep it up!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-blue-500" />;
      case 'repost':
        return <Repeat2 size={16} className="text-green-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    const { type, user, post, comment } = notification;
    
    switch (type) {
      case 'like':
        return `${user.name} liked your post`;
      case 'follow':
        return `${user.name} started following you`;
      case 'repost':
        return `${user.name} reposted your post`;
      case 'comment':
        return `${user.name} commented on your post`;
      default:
        return 'New notification';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-white" />
            <h2 className="text-white font-semibold text-lg">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex space-x-2">
            {['all', 'unread', 'like', 'follow', 'repost', 'comment'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center p-8">
              <Bell size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-colors ${
                    notification.read 
                      ? 'hover:bg-gray-800' 
                      : 'bg-blue-900/20 hover:bg-blue-900/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <img
                          src={notification.user.avatar}
                          alt={notification.user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="font-semibold">{notification.user.name}</span>
                            {' '}
                            <span className="text-gray-400">
                              {getNotificationText(notification)}
                            </span>
                          </p>
                          {notification.post && (
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                              "{notification.post.content}"
                            </p>
                          )}
                          {notification.comment && (
                            <p className="text-gray-300 text-xs mt-1">
                              "{notification.comment}"
                            </p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                        >
                          <Check size={14} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
