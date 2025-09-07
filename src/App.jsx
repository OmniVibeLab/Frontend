import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Pages
import Saved from "./pages/Saved";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import UserPost from "./pages/UserPost";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import CreatePost from "./components/CreatePost";
import EditProfile from "./pages/EditProfile";

// Components
import AppLayout from "./components/AppLayout";
import PostCreator from "./components/PostCreator";
import PhotoUpload from "./components/PhotoUpload";
import Culture from "./components/Culture";
import CulturalPhotoGallery from "./components/CulturalPhotoGallery";
import SwipeCard from "./components/SwipeCard";
import CardContent from "./components/CardContent";
import Recomended from "./components/Recomended";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes using AppLayout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/userpost/:id" element={<UserPost />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/chat" element={<Messages />} />

          {/* Standalone component routes */}
          <Route path="/postcreator" element={<PostCreator />} />
          <Route path="/photoupload" element={<PhotoUpload />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/culturalgallery" element={<CulturalPhotoGallery />} />
          <Route path="/swipecard" element={<SwipeCard />} />
          <Route path="/cardcontent" element={<CardContent />} />
          <Route path="/recomended" element={<Recomended />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
