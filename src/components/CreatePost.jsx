import React, { useState } from "react";
import { X } from "lucide-react";

const CreatePost = ({ isOpen, onClose, user, onPostCreated }) => {
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    console.log("Creating post with user:", user); // Debug log

    try {
      const postData = { 
        content: content.trim(),
        authorId: user?.id,
        authorName: user?.fullName || user?.username,
        authorUsername: user?.username,
        authorAvatar: user?.avatar
      };
      
      console.log("Sending post data:", postData); // Debug log

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const newPost = await res.json();
      console.log("Created post:", newPost); // Debug log
      console.log("Dispatching postCreated event with:", newPost);
      onPostCreated(newPost); // callback to update feed
      setContent("");
      onClose();
      
      // Trigger a custom event to refresh feeds across the app
      window.dispatchEvent(new CustomEvent('postCreated', { detail: newPost }));
    } catch (err) {
      console.error("Error creating post:", err);
      alert(`Error creating post: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <textarea
          placeholder="What's on your mind?"
          className="w-full h-32 text-white bg-gray-800 border border-gray-700 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 placeholder-gray-400"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end">
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            onClick={handleSubmit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
