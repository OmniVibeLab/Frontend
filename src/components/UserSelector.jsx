import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Circle } from 'lucide-react';
import socketService from '../services/socketService';

const UserSelector = ({ onUserSelect, currentUser, placeholder = "Search users to message...", onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadAllUsers();
    setupSocketListeners();
    
    return () => {
      socketService.off('online_users', handleOnlineUsers);
      socketService.off('user_online', handleUserOnline);
      socketService.off('user_offline', handleUserOffline);
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.on('online_users', handleOnlineUsers);
    socketService.on('user_online', handleUserOnline);
    socketService.on('user_offline', handleUserOffline);
  };

  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  const handleUserOnline = (user) => {
    setOnlineUsers(prev => [...prev, user]);
  };

  const handleUserOffline = (user) => {
    setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        const otherUsers = data.filter(user => user.id !== currentUser.id);
        setAllUsers(otherUsers);
        setFilteredUsers(otherUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Notify parent component about search change
    if (onSearchChange) {
      onSearchChange(value);
    }
    
    if (value.trim()) {
      const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
    
    setIsOpen(true);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.fullName || user.username);
    setIsOpen(false);
    onUserSelect(user);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
    onUserSelect(null);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e) => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {selectedUser && (
          <button
            onClick={handleClearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filteredUsers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className="relative">
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.fullName || user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {/* Online status indicator */}
                {isUserOnline(user.id) && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">
                  {user.fullName || user.username}
                </h3>
                <p className="text-gray-400 text-xs truncate">
                  @{user.username}
                </p>
                {isUserOnline(user.id) && (
                  <p className="text-green-400 text-xs">Online</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && searchTerm && filteredUsers.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 p-4">
          <div className="text-center text-gray-400">
            <User size={24} className="mx-auto mb-2" />
            <p>No users found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
