import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";

function Communitieispage() {
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username;
    const [activeTab, setActiveTab] = useState('explore');

    const handleNavClick = (e, path, tabId) => {
        e.preventDefault();
        setActiveTab(tabId);
        navigate(path, { state: { username } });
    };

    return(
        <div className="page-container">
            <NavBar/>
            <div className="main-content">
                <h1 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
                    Explore Page
                </h1>
                <div>
                    <h3 style={{ color: "white", textAlign: "center" }}>
                        
                            Join gaming communities, {username}!
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default Communitieispage;
