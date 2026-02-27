import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginScreen from "./components/LoginScreen";
import ExplorePage from "./components/ExplorePage";
import MessagePage from "./components/MessagePage";
import PartyFinderPage from "./components/PartyFinderPage";
import CommunitiesPage from "./components/CommunitiesPage";
import ProfilePage from "./components/ProfilePage";
import Signup from "./components/Signup";
import NotificationPage from "./components/NotificationPage";
import CommunityPage from "./components/CommunitySubPages/CommunityPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<MessagePage />} />
          <Route path="/partyfinder" element={<PartyFinderPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path = "/notifications" element={<NotificationPage/>}/>
          <Route path="/messages" element={<MessagePage />} />
          <Route path="/messages/:receiverUsername" element={<MessagePage />} />

          {/* your own profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* other users' profiles */}
          <Route path="/profile/:username" element={<ProfilePage />} />
          {/* Community Page */}
          <Route path = "/communities/:community" element={<CommunityPage/>}/>

        </Routes>
      </Router>
    </div>
  );
}

export default App;
