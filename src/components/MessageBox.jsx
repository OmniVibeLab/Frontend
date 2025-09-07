import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Image, Mic, X, MoreVertical } from 'lucide-react';
import socketService from '../services/socketService';

const MessageBox = ({ isOpen, onClose, recipient, currentUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentUser && recipient) {
      loadMessages();
      setupSocketListeners();
    }
    
    return () => {
      // Cleanup socket listeners when component unmounts or conversation changes
      socketService.off('receive_message', handleReceiveMessage);
      socketService.off('user_typing', handleTyping);
    };
  }, [isOpen, currentUser, recipient]);

  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.on('receive_message', handleReceiveMessage);
    
    // Listen for typing indicators
    socketService.on('user_typing', handleTyping);
  };

  const handleReceiveMessage = (message) => {
    // Only add message if it's from the current recipient
    if (message.sender._id === recipient.id || message.receiver._id === recipient.id) {
      const formattedMessage = {
        id: message._id,
        content: message.content,
        sender: message.sender._id,
        senderName: message.sender.fullName || message.sender.username,
        senderAvatar: message.sender.avatar,
        timestamp: new Date(message.createdAt),
        isOwn: message.sender._id === currentUser.id
      };
      
      setMessages(prev => [...prev, formattedMessage]);
    }
  };

  const handleTyping = (data) => {
    if (data.senderId === recipient.id) {
      setIsRecipientTyping(data.isTyping);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${currentUser.id}/${recipient.id}`);
      if (response.ok) {
        const conversationMessages = await response.json();
        const formattedMessages = conversationMessages.map(msg => ({
          id: msg._id,
          content: msg.content,
          sender: msg.sender._id,
          senderName: msg.sender.fullName || msg.sender.username,
          senderAvatar: msg.sender.avatar,
          timestamp: new Date(msg.createdAt),
          isOwn: msg.sender._id === currentUser.id
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageContent = message.trim();
    setMessage('');

    // Stop typing indicator
    socketService.stopTyping(recipient.id);

    // Create conversation ID
    const conversationId = [currentUser.id, recipient.id].sort().join('_');

    // Send message via Socket.IO
    const success = socketService.sendMessage({
      senderId: currentUser.id,
      receiverId: recipient.id,
      content: messageContent,
      conversationId
    });

    if (success) {
      // Add message to local state immediately for better UX
      const newMessage = {
        id: Date.now(), // Temporary ID
        content: messageContent,
        sender: currentUser.id,
        senderName: currentUser.fullName || currentUser.username,
        senderAvatar: currentUser.avatar,
        timestamp: new Date(),
        isOwn: true
      };

      setMessages(prev => [...prev, newMessage]);
    } else {
      console.error('Failed to send message via Socket.IO');
      // Fallback to HTTP API
      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderId: currentUser.id,
            receiverId: recipient.id,
            content: messageContent
          })
        });

        if (response.ok) {
          const savedMessage = await response.json();
          
          // Update the temporary message with real data
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? {
                  ...msg,
                  id: savedMessage._id,
                  timestamp: new Date(savedMessage.createdAt)
                }
              : msg
          ));
        }
      } catch (error) {
        console.error('Error sending message via HTTP fallback:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        socketService.startTyping(recipient.id);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(recipient.id);
      }, 1000);
    } else {
      if (isTyping) {
        setIsTyping(false);
        socketService.stopTyping(recipient.id);
      }
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 w-full h-[85vh] sm:h-[600px] sm:w-[400px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <img
              src={recipient.avatar || 'https://via.placeholder.com/40'}
              alt={recipient.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-white font-semibold text-sm">{recipient.fullName}</h3>
              <p className="text-gray-400 text-xs">@{recipient.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <MoreVertical size={18} className="text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">
              <p>Start a conversation with {recipient.fullName}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-[80%] ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!msg.isOwn && (
                    <img
                      src={msg.senderAvatar || 'https://via.placeholder.com/32'}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={`px-3 py-2 rounded-2xl ${
                    msg.isOwn 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-white'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.isOwn ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-2">
                <img
                  src={recipient.avatar || 'https://via.placeholder.com/32'}
                  alt={recipient.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="bg-gray-800 px-3 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-end space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Image size={20} className="text-gray-400" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Mic size={20} className="text-gray-400" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-gray-800 text-white rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px'
                }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition-colors">
                <Smile size={18} className="text-gray-400" />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
