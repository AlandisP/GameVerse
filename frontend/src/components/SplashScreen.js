import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/GameVerse_LogoV2.png";
import "./SplashScreen.css";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const timer = setTimeout(() => {
      if (token) {
        navigate("/home", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <img className="splash-logo" src={logo} alt="GameVerse Logo" />
      <h1 className="splash-title">GameVerse</h1>
      <p className="splash-subtitle">Loading your next adventure...</p>
    </div>
  );
}

export default SplashScreen;
