import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";
import NavBar from "./NavBar";
function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const loggedInUsername = localStorage.getItem("username");

    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let res;

                if (username) {
                    res = await axios.get(
                        `http://localhost:8080/profile/${username}`,
                        token
                            ? { headers: { Authorization: `Bearer ${token}` } }
                            : undefined
                    );
                } else {
                    res = await axios.get("http://localhost:8080/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }

                setProfile(res.data);
                setBio(res.data.bio || "");
            } catch (err) {
                if (err.response?.status === 404) {
                    setProfile(null);
                } else {
                    console.error("Error loading profile:", err);
                }
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
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/");
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
        } catch (err) {
            alert("Error saving bio.");
        }
    };

    // Sidebar Component
    const Sidebar = () => (
        <NavBar/>
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

    return (
        <div className="page-container">
            <Sidebar />

            <div className="main-content" style={{ color: "white" }}>
                {/* HEADER */}
                <div
                    style={{
                        backgroundColor: "#2f2f2f",
                        paddingBottom: "20px",
                        borderRadius: "0 0 12px 12px",
                        marginBottom: "25px",
                        position: "relative",
                    }}
                >
                    {/* Banner */}
                    <div
                        style={{
                            height: "150px",
                            backgroundColor: "#3f4b5b",
                            borderRadius: "0 0 12px 12px",
                        }}
                    ></div>

                    {/* Avatar */}
                    <div
                        style={{
                            position: "absolute",
                            top: "90px",
                            left: "30px",
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            backgroundColor: "#1c1c1c",
                            border: "4px solid #2f2f2f",
                        }}
                    ></div>

                    {/* Username */}
                    <div style={{ padding: "20px", marginTop: "40px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <h1 style={{ marginBottom: "5px" }}>{profile.username}</h1>
                                <p style={{ marginTop: 0, color: "#aaaaaa" }}>
                                    @{profile.username}
                                </p>
                            </div>

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

                        {/* Bio */}
                        {editMode ? (
                            <>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "80px",
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
                                        padding: "8px 15px",
                                        backgroundColor: "#058BFE",
                                        border: "none",
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        color: "white",
                                    }}
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() => setEditMode(false)}
                                    style={{
                                        marginLeft: "10px",
                                        marginTop: "10px",
                                        padding: "8px 15px",
                                        backgroundColor: "#777",
                                        border: "none",
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        color: "white",
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <p>{profile.bio || "No bio yet."}</p>
                        )}
                    </div>
                </div>

                {/* TABS */}
                <div
                    style={{
                        borderBottom: "1px solid #444",
                        marginBottom: "15px",
                        display: "flex",
                        justifyContent: "space-around",
                    }}
                >
                    {["posts", "media", "likes"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: "transparent",
                                color: activeTab === tab ? "#058BFE" : "#aaaaaa",
                                border: "none",
                                borderBottom:
                                    activeTab === tab ? "3px solid #058BFE" : "none",
                                fontSize: "1rem",
                                cursor: "pointer",
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                {activeTab === "posts" && (
                    <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
                        No posts yet.
                    </p>
                )}

                {activeTab === "media" && (
                    <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
                        No media uploaded yet.
                    </p>
                )}

                {activeTab === "likes" && (
                    <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
                        No liked posts yet.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
