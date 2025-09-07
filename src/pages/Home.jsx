import React, { useState, useEffect } from "react";
import Feed from "../components/Feed";
import authService from "../services/authService";

const Home = () => {
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    setUser(userData);
  }, []);

  // Listen for post creation events from the global CreatePost modal
  useEffect(() => {
    const handlePostCreated = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  return (
    <div>
      <Feed 
        user={user} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Home;
