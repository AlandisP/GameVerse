import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";

function PartyFinderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username;
    const [activeTab, setActiveTab] = useState('partyfinder');

    const handleNavClick = (e, path, tabId) => {
        e.preventDefault();
        setActiveTab(tabId);
        navigate(path, { state: { username } });
    };

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
            Party Finder
        </h1>
    </div>
                
                <div>
                    <h3 style={{ color: "white", textAlign: "center" }}>
                        Find your gaming squad, {username}!
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default PartyFinderPage;