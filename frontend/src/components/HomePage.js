import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom';
function HomePage() {
    const history = useNavigate();
    const location = useLocation();
    const username = location.state?.username;
    return(
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
                Home Page
                <div>
                    <h3>Welcome {username}, you are logged in!</h3>
                </div>
            </h1>
        </div>

    );
}

export default HomePage;
