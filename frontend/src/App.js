import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from "react-router-dom";
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

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname;
    const publicPaths = ["/", "/login", "/signup", "/about"];
    if (token && publicPaths.includes(currentPath)) {
      navigate("/home");
    }
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      if (localStorage.getItem("sessionOnly") === "true") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        localStorage.removeItem("sessionOnly");
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagePage /></ProtectedRoute>} />
      <Route path="/messages/:receiverUsername" element={<ProtectedRoute><MessagePage /></ProtectedRoute>} />
      <Route path="/partyfinder" element={<ProtectedRoute><PartyFinderPage /></ProtectedRoute>} />
      <Route path="/communities" element={<ProtectedRoute><CommunitiesPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePageTwo /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><ProfilePageTwo /></ProtectedRoute>} />
      <Route path="/communities/:community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}

export default App;