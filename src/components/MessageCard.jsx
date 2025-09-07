import React, { useState } from 'react';
import { 
  Check, CheckCheck, Smile, MoreVertical, Reply, 
  Forward, Edit, Trash2, Heart, ThumbsUp, Laugh, 
  Angry, Sad, Surprised 
} from 'lucide-react';
import socketService from '../services/socketService';

const MessageCard = ({ message, currentUser, onReply, onForward, onEdit, onDelete }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOwn = message.sender === currentUser.id || message.sender._id === currentUser.id;
  const messageId = message._id || message.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const handleReaction = (reaction) => {
    socketService.addReaction(messageId, reaction);
    setShowReactions(false);
  };

  const handleReply = () => {
    onReply && onReply(message);
    setShowOptions(false);
  };

  const handleForward = () => {
    onForward && onForward(message);
    setShowOptions(false);
  };

  const handleEdit = () => {
    onEdit && onEdit(message);
    setShowOptions(false);
  };

  const handleDelete = () => {
    onDelete && onDelete(message);
    setShowOptions(false);
  };

  const reactions = [
    { emoji: '❤️', icon: Heart, name: 'love' },
    { emoji: '👍', icon: ThumbsUp, name: 'like' },
    { emoji: '😂', icon: Laugh, name: 'laugh' },
    { emoji: '😢', icon: Sad, name: 'sad' },
    { emoji: '😮', icon: Surprised, name: 'wow' },
    { emoji: '😠', icon: Angry, name: 'angry' }
  ];

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <img
            src={message.senderAvatar || 'https://via.placeholder.com/32'}
            alt={message.senderName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}

        {/* Message Content */}
        <div className="relative">
          {/* Reply Context */}
          {message.replyTo && (
            <div className="mb-2 p-2 bg-gray-800 rounded-lg border-l-2 border-blue-500">
              <p className="text-xs text-gray-400 mb-1">
                Replying to {message.replyTo.senderName}
              </p>
              <p className="text-sm text-gray-300 truncate">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Message Bubble */}
          <div className={`relative px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-white'
          }`}>
            {/* Message Type Indicator */}
            {message.messageType === 'forwarded' && (
              <div className="text-xs text-gray-300 mb-1 flex items-center">
                <Forward size={12} className="mr-1" />
                Forwarded
              </div>
            )}

            {/* Message Content */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    {attachment.type === 'image' && (
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="max-w-full h-auto max-h-64 object-cover"
                      />
                    )}
                    {attachment.type === 'file' && (
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium">{attachment.filename}</p>
                        <p className="text-xs text-gray-400">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(message.reactions.entries()).map(([userId, reaction]) => (
                  <span
                    key={userId}
                    className="text-xs bg-gray-700 px-2 py-1 rounded-full"
                    title={`Reacted with ${reaction}`}
                  >
                    {reaction}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message Info */}
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt || message.timestamp)}
            </span>
            {isOwn && getStatusIcon(message.status)}
          </div>

          {/* Action Buttons */}
          {(isHovered || showOptions) && (
            <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform -translate-y-full mb-2`}>
              <div className="flex items-center space-x-1 bg-gray-900 rounded-lg p-1 shadow-lg">
                {/* Reaction Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                    title="Add reaction"
                  >
                    <Smile size={16} className="text-gray-400" />
                  </button>
                  
                  {/* Reactions Popup */}
                  {showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg p-2 shadow-lg flex space-x-1">
                      {reactions.map((reaction) => (
                        <button
                          key={reaction.name}
                          onClick={() => handleReaction(reaction.emoji)}
                          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                          title={reaction.name}
                        >
                          <span className="text-lg">{reaction.emoji}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* More Options */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                    title="More options"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                  
                  {/* Options Menu */}
                  {showOptions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg py-1 min-w-32">
                      <button
                        onClick={handleReply}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <Reply size={14} className="mr-2" />
                        Reply
                      </button>
                      <button
                        onClick={handleForward}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <Forward size={14} className="mr-2" />
                        Forward
                      </button>
                      {isOwn && (
                        <>
                          <button
                            onClick={handleEdit}
                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                          >
                            <Edit size={14} className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={handleDelete}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
