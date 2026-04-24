import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginScreen from "./components/LoginScreen";
import SplashScreen from "./components/SplashScreen";
import ExplorePage from "./components/ExplorePage";
import MessagePage from "./components/MessagePage";
import PartyFinderPage from "./components/PartyFinderPage";
import CommunitiesPage from "./components/CommunitiesPage";
import ProfilePageTwo from "./components/ProfilePageTwo";
import Signup from "./components/Signup";
import NotificationPage from "./components/NotificationPage";
import CommunityPage from "./components/CommunitySubPages/CommunityPage";
import SettingsPage from "./components/SettingsPage";
import AboutPage from "./components/AboutPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<MessagePage />} />
          <Route path="/messages/:receiverUsername" element={<MessagePage />} />
          <Route path="/partyfinder" element={<PartyFinderPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/profile" element={<ProfilePageTwo />} />
          <Route path="/profile/:username" element={<ProfilePageTwo />} />
          <Route path="/communities/:community" element={<CommunityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
