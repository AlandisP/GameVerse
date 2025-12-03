import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles.css";

function ProfilePage() {
    const { username } = useParams();
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
                    // Viewing someone else's profile
                    res = await axios.get(
                        `http://localhost:8080/profile/${username}`,
                        token
                            ? { headers: { Authorization: `Bearer ${token}` } }
                            : undefined
                    );
                } else {
                    // Viewing own profile
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

    if (loading) {
        return (
            <div className="main-content">
                <h2 style={{ color: "white" }}>Loading profile...</h2>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="main-content">
                <h2 style={{ color: "white" }}>Profile not found.</h2>
            </div>
        );
    }

    const isOwnProfile =
        !username || username.toLowerCase() === loggedInUsername?.toLowerCase();

    return (
        <div className="main-content" style={{ color: "white" }}>
            {/* ------------------------------------------------------
                 PROFILE HEADER (Twitter-style)
            ------------------------------------------------------- */}
            <div
                style={{
                    backgroundColor: "#2f2f2f",
                    paddingBottom: "20px",
                    borderRadius: "0 0 12px 12px",
                    marginBottom: "25px",
                    position: "relative",
                }}
            >
                {/* Banner placeholder */}
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

                {/* Username + Edit Button */}
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
                                    padding: "8px 15px",
                                    backgroundColor: "transparent",
                                    border: "1px solid white",
                                    color: "white",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    height: "35px",
                                }}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Bio */}
                    <div style={{ marginTop: "10px" }}>
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
            </div>

            {/* ------------------------------------------------------
     TABS (Posts / Media / Likes)
------------------------------------------------------- */}
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

{/* ------------------------------------------------------
     TAB CONTENT (Posts / Media / Likes)
------------------------------------------------------- */}
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
    );
}

export default ProfilePage;
