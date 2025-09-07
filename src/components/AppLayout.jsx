import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import Logo from "../upload/logo.png";
import CreatePost from "../components/CreatePost";
import NotificationCenter from "../components/NotificationCenter";
import {
  Home, Search, User, Bell, Settings, Compass,
  MessageCircle, PlusSquare, Bookmark, LogOut
} from "lucide-react";
import authService from "../services/authService";
import socketService from "../services/socketService";
import { toast } from "react-hot-toast";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch user & check login
  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData) {
      navigate("/login");
    } else {
      setUser(userData);
      // Connect to Socket.IO when user is logged in
      socketService.connect(userData);
    }
    
    return () => {
      // Disconnect from Socket.IO when component unmounts
      socketService.disconnect();
    };
  }, [navigate]);

  const handleLogout = () => {
    // Disconnect from Socket.IO before logout
    socketService.disconnect();
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Combined navigation (main + secondary)
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Messages", href: "/chat", icon: MessageCircle },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Create", icon: PlusSquare, onClick: () => setShowCreatePost(true) },
    { name: "Profile", href: `/profile/${user?.username}`, icon: User },
    { name: "Saved", href: "/saved", icon: Bookmark },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Current page name for header
  const getCurrentPageName = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return "Home";
    if (currentPath === "/search") return "Search";
    if (currentPath === "/explore") return "Explore";
    if (currentPath === "/chat" || currentPath === "/messages") return "Messages";
    if (currentPath === "/notifications") return "Notifications";
    if (currentPath === "/settings") return "Settings";
    if (currentPath === "/saved") return "Saved";
    if (currentPath.startsWith("/profile/")) return "Profile";
    return "Home";
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Create Post Modal */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        user={user}
        onPostCreated={() => setShowCreatePost(false)}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        currentUser={user}
      />

      {/* Sidebar (Desktop - Fixed) */}
      <div className="hidden sm:flex fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 via-black/95 to-gray-900 backdrop-blur-lg border-r border-gray-700/50 flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700/50">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Logo" className="w-8 h-8 rounded-md" />
            <span className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">OmniVibe</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {navigation.map((item) =>
            item.onClick ? (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href) 
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg" 
                    : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10"
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href) 
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg" 
                    : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10"
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            )
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || "https://via.placeholder.com/32"}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-white">{user?.fullName}</p>
              <p className="text-xs text-gray-400">@{user?.username}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto text-red-400 hover:text-red-300">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (adds left margin for fixed sidebar) */}
      <div className="flex-1 flex flex-col sm:ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-30">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{getCurrentPageName()}</h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-full hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200 relative"
              >
                <Bell size={20} className="text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
              </button>
              <Link to={`/profile/${user?.username}`} className="p-1 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 rounded-full transition-all duration-200">
                <img
                  src={user?.avatar || "https://via.placeholder.com/32"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-black">
          <div className="px-4 py-4 pb-20 sm:pb-4">
            <Outlet />
          </div>
        </main>
      </div>

     {/* Mobile Bottom Navbar - Noplace Style with Gradients */}
<nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900/95 to-black/80 backdrop-blur-lg border-t border-gray-700/50 flex justify-around items-center h-16 z-40 px-2">
  {navigation
    // Filter only important items for mobile
    .filter(item => ["Home", "Search", "Explore", "Messages", "Create"].includes(item.name))
    .map((item) =>
      item.onClick ? (
        <button
          key={item.name}
          onClick={item.onClick}
          className={`flex flex-col items-center justify-center text-xs py-2 px-3 rounded-xl transition-all duration-300 ${
            isActive(item.href) 
              ? "text-white bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-105 shadow-lg" 
              : "text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10"
          }`}
        >
          <item.icon size={24} className="mb-1" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </button>
      ) : (
        <Link
          key={item.name}
          to={item.href}
          className={`flex flex-col items-center justify-center text-xs py-2 px-3 rounded-xl transition-all duration-300 ${
            isActive(item.href) 
              ? "text-white bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-105 shadow-lg" 
              : "text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10"
          }`}
        >
          <item.icon size={24} className="mb-1" />
          <span className="text-[10px] font-medium">{item.name}</span>
        </Link>
      )
    )}
</nav>

    </div>
  );
};

export default AppLayout;
