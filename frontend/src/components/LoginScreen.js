import "./styles.css";
import logo from "../images/GameVerse_LogoV2.png";
import React, { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const history = useNavigate();

  const HandleLogin = async () => {
    try {
      if (!username || !password) {
        setError("Please fill in the fields");
        return;
      }
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
        rememberMe,
      });
      setError("Logged in!");
      //console.log("Login Successful:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("userId", response.data.userId);
      if (!rememberMe) {
        sessionStorage.setItem("sessionOnly", "true");
      } else {
        sessionStorage.removeItem("sessionOnly");
      }
      history("/home");
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.data : error.message,
      );
      setError("Invalid Username or Password");
    }
  };

  useEffect(() => {
    const handleUnload = () => {
      if (sessionStorage.getItem("sessionOnly") === "true") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
}, []);

  return (
    <div className="App">
      <div className="bg">
        <div className="Header">
          <div>
            <img className="logo" src={logo} />
          </div>
          <div>
            <h1 className="HeaderE">GameVerse</h1>
          </div>
          <div className="spacer"></div>
        </div>
        <div className="LoginScreen">
          <h1>Welcome Back!</h1>
          <p className="intro-text">
            Lets hop right back into action by logging in!
          </p>
          <div className="Username">
            <h3>Username</h3>
            <input
              className="InputBox"
              type="text"
              id="userinput"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="Password">
            <h3>Password</h3>
            <input
              className="InputBox"
              type="password"
              id="passinput"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#3b82f6' }}
              />
              {" "}Remember Me
            </label>
          </div>
          <button className="LoginButton" onClick={HandleLogin}>
            Login
          </button>
          <p className="Create-Account">
            Don't have an account?{" "}
            <a href="/signup" className="CA-Link">
              Create One!
            </a>
          </p>
          <p className="error-text">{error}</p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
