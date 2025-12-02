import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

// -------- Helper placeholders (until backend features arrive) -------------//
const placeholderActivity = [
    {
        title: "Won Valorant Tournament",
        subtitle: "Platinum League Finals - 1st Place",
        time: "2 hours ago",
    },
    {
        title: "Completed 100 Wins Challenge",
        subtitle: "CS:GO Competitive",
        time: "3 days ago",
    },
];

const placeholderFriends = [
    { name: "SniperElite", status: "Offline" },
    { name: "TankMaster", status: "Offline" },
    { name: "RushKing3", status: "Online" },
    { name: "RushKing44", status: "Offline" },
    { name: "SupportQueen", status: "In Game" },
    { name: "RushKing", status: "Online" },
    { name: "StealthNinja", status: "Online" },
];
// ----------------------------------------------------------------------------- //

function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const loggedInUsername = localStorage.getItem("username");

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                let res;
                if (username) {
                    res = await axios.get(`http://localhost:8080/profile/${username}`);
                } else {
                    res = await axios.get("http://localhost:8080/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }

                setProfile(res.data);
                setBio(res.data.bio || "");
            } catch {
                console.error("Error loading profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, token]);

    const handleNavClick = (e, path, tabId) => {
        e.preventDefault();
        setActiveTab(tabId);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    const handleSaveBio = async () => {
        try {
            await axios.put(
                "http://localhost:8080/profile",
                { bio },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile({ ...profile, bio });
            setEditMode(false);
        } catch {
            alert("Error saving bio");
        }
    };

    // Create a reusable Sidebar component function
    const Sidebar = () => (
        <nav className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <img 
                            src={require('../images/GameVerse_Logo.png')} 
                            alt="GameVerse Logo" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <span className="logo-text">GameVerse</span>
                </div>
            </div>

            <div className="nav-items">
                <div className="nav-links">
                    <a 
                        href="/home" 
                        className={activeTab === 'home' ? 'active' : ''}
                        onClick={(e) => handleNavClick(e, '/home', 'home')}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </a>
                    
                    <a 
                        href="/explore"
                        className={activeTab === 'explore' ? 'active' : ''}
                        onClick={(e) => handleNavClick(e, '/explore', 'explore')}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Explore
                    </a>
                    
                    <a 
                        href="/messages"
                        className={activeTab === 'messages' ? 'active' : ''}
                        onClick={(e) => handleNavClick(e, '/messages', 'messages')}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Messages
                    </a>
                    
                    <a 
                        href="/partyfinder"
                        className={activeTab === 'partyfinder' ? 'active' : ''}
                        onClick={(e) => handleNavClick(e, '/partyfinder', 'partyfinder')}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Party Finder
                    </a>
                    
                    <a 
                        href="/communities"
                        className={activeTab === 'communities' ? 'active' : ''}
                        onClick={(e) => handleNavClick(e, '/communities', 'communities')}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Communities
                    </a>
                    
                    <a 
                        href="/profile"
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={(e) => handleNavClick(e, '/profile', 'profile')}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </a>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="user-profile">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>@{loggedInUsername || 'Guest'}</span>
                </button>

                <button 
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );

    if (loading) {
        return (
            <div className="page-container">
                <Sidebar />
                <div className="main-content">
                    <h2 style={{ color: "white" }}>Loading profile...</h2>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page-container">
                <Sidebar />
                <div className="main-content">
                    <h2 style={{ color: "white" }}>Profile not found.</h2>
                </div>
            </div>
        );
    }

    const isOwnProfile =
        !username || username.toLowerCase() === loggedInUsername?.toLowerCase();

    // ===================== PAGE START ============================= //

    return (
        <div className="page-container">
            <Sidebar />

            {/* Main Profile Content */}
            <div className="main-content" style={{ color: "white" }}>
                {/* ------------------------------------------------------
                     PROFILE HEADER CARD
                ------------------------------------------------------- */}
                <div
                    style={{
                        backgroundColor: "#2f2f2f",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "30px",
                    }}
                >
                    {/* Avatar + Name Row */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                        {/* Avatar Circle */}
                        <div
                            style={{
                                width: "110px",
                                height: "110px",
                                borderRadius: "50%",
                                backgroundColor: "#3f4b5b",
                                marginRight: "25px",
                            }}
                        ></div>

                        {/* User Info */}
                        <div>
                            <h1 style={{ margin: 0, fontSize: "2rem" }}>@{profile.username}</h1>
                            <p style={{ marginTop: "5px", color: "#cfcfcf" }}>
                                Level 42 Elite Player (placeholder)
                            </p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div
                        style={{
                            display: "flex",
                            gap: "40px",
                            marginTop: "10px",
                            color: "#cccccc",
                        }}
                    >
                        <span>👥 1.2K Followers</span>
                        <span>👤 356 Following</span>
                        <span>⏱️ 2,450 Hours Played</span>
                    </div>

                    {/* Bio Section */}
                    <div style={{ marginTop: "25px" }}>
                        <h3>Bio</h3>
                        {editMode ? (
                            <>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "100px",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        backgroundColor: "#444",
                                        color: "white",
                                    }}
                                />
                                <br />
                                <button
                                    onClick={handleSaveBio}
                                    style={{
                                        marginTop: "10px",
                                        padding: "10px 20px",
                                        backgroundColor: "#058BFE",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    style={{
                                        marginLeft: "10px",
                                        marginTop: "10px",
                                        padding: "10px 20px",
                                        backgroundColor: "#777",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <p style={{ color: "#cccccc" }}>
                                {profile.bio || (isOwnProfile ? "You have no bio yet." : "No bio yet.")}
                            </p>
                        )}

                        {isOwnProfile && !editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                style={{
                                    marginTop: "10px",
                                    padding: "10px 20px",
                                    backgroundColor: "#058BFE",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                Edit Bio
                            </button>
                        )}
                    </div>
                </div>

                {/* ------------------------------------------------------
                     RECENT ACTIVITY
                ------------------------------------------------------- */}
                <div
                    style={{
                        backgroundColor: "#2f2f2f",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "30px",
                    }}
                >
                    <h2>Recent Activity</h2>

                    {placeholderActivity.map((act, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: "#3b3b3b",
                                padding: "15px",
                                borderRadius: "10px",
                                marginTop: "15px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <h4 style={{ margin: 0 }}>{act.title}</h4>
                                <p style={{ margin: 0, color: "#bbbbbb" }}>{act.subtitle}</p>
                            </div>
                            <span style={{ color: "#aaaaaa" }}>{act.time}</span>
                        </div>
                    ))}
                </div>

                {/* ------------------------------------------------------
                     FRIENDS LIST
                ------------------------------------------------------- */}
                <div
                    style={{
                        backgroundColor: "#2f2f2f",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "30px",
                    }}
                >
                    <h2>Friends</h2>

                    <div style={{ display: "flex", overflowX: "auto", gap: "20px", marginTop: "20px" }}>
                        {placeholderFriends.map((f, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        width: "65px",
                                        height: "65px",
                                        borderRadius: "50%",
                                        backgroundColor: "#3f4b5b",
                                        marginBottom: "10px",
                                    }}
                                ></div>
                                <p style={{ margin: 0 }}>{f.name}</p>
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "#999" }}>
                                    {f.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ------------------------------------------------------
                     ACHIEVEMENTS
                ------------------------------------------------------- */}
                <div
                    style={{
                        backgroundColor: "#2f2f2f",
                        padding: "25px",
                        borderRadius: "12px",
                    }}
                >
                    <h2>Achievements</h2>

                    <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                        {[1, 2, 3, 4, 5].map((box) => (
                            <div
                                key={box}
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    backgroundColor: "#3f4b5b",
                                    borderRadius: "10px",
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;