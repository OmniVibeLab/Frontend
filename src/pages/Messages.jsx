import React, { useState, useEffect } from "react";
import { MessageCircle, Search, Clock } from "lucide-react";
import authService from "../services/authService";
import socketService from "../services/socketService";
import MessageInput from "../components/MessageInput";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      socketService.connect(user);
      loadConversations();
      setupSocketListeners();
    }

    return () => {
      socketService.off("online_users", handleOnlineUsers);
      socketService.off("user_online", handleUserOnline);
      socketService.off("user_offline", handleUserOffline);
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.on("online_users", handleOnlineUsers);
    socketService.on("user_online", handleUserOnline);
    socketService.on("user_offline", handleUserOffline);
  };

  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  const handleUserOnline = (user) => {
    setOnlineUsers((prev) => [...prev, user]);
  };

  const handleUserOffline = (user) => {
    setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId));
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/messages/conversations/${currentUser.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherUser = (conversation) => {
    const lastMessage = conversation.lastMessage;
    if (lastMessage.sender._id === currentUser.id) {
      return lastMessage.receiverInfo[0];
    } else {
      return lastMessage.senderInfo[0];
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.userId === userId);
  };

  // Get all users from conversations
  const getUsersFromConversations = () => {
    if (!conversations) return [];
    return conversations.map((conv) => {
      const otherUser = getOtherUser(conv);
      return {
        id: otherUser.id || otherUser._id,
        username: otherUser.username,
        fullName: otherUser.fullName,
        avatar: otherUser.avatar,
        online: isUserOnline(otherUser.id),
        conversationId: conv._id,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0,
      };
    });
  };

  const filteredUsers = getUsersFromConversations().filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-black min-h-screen">
      {/* Search bar */}
      <div className="flex items-center mb-4">
        <Search size={20} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none placeholder-gray-500"
        />
      </div>

      {/* Message input */}
      <div className="mb-6">
        <MessageInput
          currentUser={currentUser}
          selectedConversation={selectedConversation}
          onMessageSent={() => loadConversations()}
        />
      </div>

      {/* Conversations / Contacts */}
      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No conversations yet</h2>
            <p className="text-gray-400 mb-6">Start a conversation with someone!</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() =>
                setSelectedConversation({
                  _id: user.conversationId,
                  lastMessage: user.lastMessage,
                  otherUser: user,
                })
              }
            >
              <div className="relative">
                <img
                  src={user.avatar || "https://via.placeholder.com/50"}
                  alt={user.fullName || user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {user.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                )}
                {user.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{user.unreadCount}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 ml-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold truncate">{user.fullName || user.username}</h3>
                  <div className="flex items-center space-x-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-400">{formatTime(user.lastMessage.createdAt)}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm truncate">
                  {user.lastMessage.sender._id === currentUser.id ? "You: " : ""}
                  {user.lastMessage.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
