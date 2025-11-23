import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    const token = localStorage.getItem("token");
    const loggedInUsername = localStorage.getItem("username");

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState("");
    const [editMode, setEditMode] = useState(false);

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

    // ===================== PAGE START ============================= //

    return (
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
    );
}

export default ProfilePage;
