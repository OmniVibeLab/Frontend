import React, { useState, useRef } from 'react';
import { Send, Smile, Image, Mic, X } from 'lucide-react';
import UserSelector from './UserSelector';
import socketService from '../services/socketService';

function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() === '') return;
    if (onSendMessage) onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex items-center w-full p-2 bg-gray-900 rounded-full shadow-inner">
      {/* Emoji button */}
      <button className="p-2 text-gray-400 hover:text-yellow-400">
        <Smile size={20} />
      </button>

      {/* Image upload */}
      <button className="p-2 text-gray-400 hover:text-blue-400">
        <Image size={20} />
      </button>

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 mx-2 focus:outline-none placeholder-gray-500"
      />

      {/* Microphone */}
      <button className="p-2 text-gray-400 hover:text-green-400">
        <Mic size={20} />
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 ml-2"
      >
        <Send size={20} />
      </button>
    </div>
  );
}

export default MessageInput;
