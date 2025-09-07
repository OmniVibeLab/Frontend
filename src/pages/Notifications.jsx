import React, { useState, useEffect } from "react";
import { Bell, UserPlus, Heart, MessageCircle, Compass } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications([
      {
        id: 1,
        type: "follow",
        username: "abhaya",
        avatar: "https://via.placeholder.com/40",
        time: "2h ago",
      },
      {
        id: 2,
        type: "like",
        username: "gaurab",
        avatar: "https://via.placeholder.com/40",
        post: "Just launched my new project 🚀",
        time: "5h ago",
      },
      {
        id: 3,
        type: "comment",
        username: "luna",
        avatar: "https://via.placeholder.com/40",
        comment: "This is amazing!",
        post: "Dark mode >>> Light mode 🌙",
        time: "1d ago",
      },
    ]);
  }, []);

  const renderIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="text-blue-400" size={20} />;
      case "like":
        return <Heart className="text-red-500" size={20} />;
      case "comment":
        return <MessageCircle className="text-green-400" size={20} />;
      default:
        return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="w-full min-h-screen  p-2 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 py-4 px-2 border-b border-gray-700">
        <Compass size={24} className="text-blue-400" />
        <p className="text-lg font-semibold">Activity</p>
      </div>

      {/* Notifications */}
      <div className="mt-2">
        {notifications.length === 0 && (
          <p className="text-gray-400 text-center py-4">No notifications yet.</p>
        )}

        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-center w-full py-3 px-2 hover:bg-gray-800 transition-colors"
          >
            {/* Icon */}
            <div className="mr-3">{renderIcon(notif.type)}</div>

            {/* Avatar */}
            <img
              src={notif.avatar}
              alt={notif.username}
              className="w-10 h-10 rounded-full mr-3 border border-gray-700"
            />

            {/* Content */}
            <div className="flex-1 text-sm">
              {notif.type === "follow" && (
                <p>
                  <span className="font-semibold">@{notif.username}</span> started following you.
                </p>
              )}
              {notif.type === "like" && (
                <p>
                  <span className="font-semibold">@{notif.username}</span> liked your post:{" "}
                  <span className="italic">"{notif.post}"</span>
                </p>
              )}
              {notif.type === "comment" && (
                <p>
                  <span className="font-semibold">@{notif.username}</span> commented:{" "}
                  <span className="italic">"{notif.comment}"</span>
                </p>
              )}
              <span className="text-xs text-gray-400">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
