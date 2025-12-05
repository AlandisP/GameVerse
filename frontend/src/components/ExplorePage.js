import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ExplorePage() {
  return (
    <div>
      <nav className="nav-links" id="navLinks">
        <a href="/home">Home</a>
        <a href="/explore">Explore</a>
        <a href="/messages">Messages</a>
        <a href="/partyfinder">Party Finder</a>
        <a href="/communities">Communities</a>
        <a href="/profile">Profile</a>
      </nav>

      <h1 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Explore Page
      </h1>
    </div>
  );
}

export default ExplorePage;
