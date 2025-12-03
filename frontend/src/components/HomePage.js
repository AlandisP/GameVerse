import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";

function HomePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('home');

    const handleNavClick = (e, path, tabId) => {
        e.preventDefault();
        setActiveTab(tabId);
        navigate(path);

    };

    const handleLogout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    }

    return(
        <div className="page-container">
            <NavBar/>
            <div className="main-content">
    <div style={{ 
        borderBottom: "1px solid #000000ff", 
        paddingBottom: "10px",
        marginLeft: "-20px", 
        paddingLeft: "20px" 
    }}>
        <h1 style={{ 
            color: "white", 
            textAlign: "left",
            marginTop: "50px",
            marginLeft: "20px",
            marginBottom: "0"
        }}>
            Feed
        </h1>
    </div>
    <div>
        <h3 style={{ color: "white", textAlign: "center" }}>
            Welcome {username}, you are logged in!
        </h3>
    </div>
</div>
        </div>
    );
}

export default HomePage;