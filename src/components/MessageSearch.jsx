import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageCircle, User, Calendar } from 'lucide-react';

const MessageSearch = ({ isOpen, onClose, currentUser, onMessageSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('all'); // 'all' or 'conversation'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchType, selectedConversation, page]);

  const performSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setLoading(true);
    try {
      let url;
      if (searchType === 'conversation' && selectedConversation) {
        url = `/api/messages/search/${selectedConversation}?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=20`;
      } else {
        url = `/api/messages/search/user/${currentUser.id}?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=20`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (page === 1) {
          setSearchResults(data.messages);
        } else {
          setSearchResults(prev => [...prev, ...data.messages]);
        }
        setHasMore(data.page < data.pages);
      } else {
        console.error('Search error:', data.message);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setPage(1);
    setSearchResults([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleMessageClick = (message) => {
    onMessageSelect && onMessageSelect(message);
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900">$1</mark>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Search Messages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="p-4 border-b border-gray-700">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Search Type Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleSearchTypeChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => handleSearchTypeChange('conversation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'conversation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Current Conversation
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && page === 1 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((message) => (
                <div
                  key={message._id}
                  onClick={() => handleMessageClick(message)}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={message.sender.avatar || 'https://via.placeholder.com/40'}
                      alt={message.sender.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">
                          {message.sender.fullName || message.sender.username}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p
                        className="text-gray-300 text-sm"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(message.content, searchQuery)
                        }}
                      />
                      {message.messageType !== 'text' && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MessageCircle size={12} className="mr-1" />
                          {message.messageType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          ) : searchQuery.trim().length >= 2 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No messages found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Enter at least 2 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
