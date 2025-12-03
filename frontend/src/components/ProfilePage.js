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
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let res;

        if (username) {
          // viewing someone else's profile
          res = await axios.get(
            `http://localhost:8080/profile/${username}`,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined
          );
        } else {
          // viewing own profile
          res = await axios.get("http://localhost:8080/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        setProfile(res.data);
        setBio(res.data.bio || "");

        // If viewing someone else's profile and logged in, fetch follow status
        if (username && token) {
          try {
            const followRes = await axios.get(
              `http://localhost:8080/profile/${username}/isFollowing`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFollowing(followRes.data === true);
          } catch (err) {
            console.error("Error checking follow status:", err);
          }
        } else {
          setIsFollowing(false);
        }
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

    if (token || !username) {
      // If viewing self, we assume token exists
      fetchProfile();
    } else {
      // No token and viewing someone else: still fetch public profile (no auth header)
      (async () => {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:8080/profile/${username}`);
          setProfile(res.data);
          setBio(res.data.bio || "");
          setIsFollowing(false);
        } catch (err) {
          if (err.response?.status === 404) {
            setProfile(null);
          } else {
            console.error("Error loading profile:", err);
          }
        } finally {
          setLoading(false);
        }
      })();
    }
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

  const handleFollow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/profile/${profile.username}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(true);
      // Optimistically update follower count
      setProfile((prev) =>
        prev
          ? { ...prev, followerCount: (prev.followerCount || 0) + 1 }
          : prev
      );
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/profile/${profile.username}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(false);
      // Optimistically update follower count
      setProfile((prev) =>
        prev
          ? { ...prev, followerCount: Math.max((prev.followerCount || 1) - 1, 0) }
          : prev
      );
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const Sidebar = () => <NavBar />;

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

          {/* Username + actions */}
          <div style={{ padding: "20px", marginTop: "40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1 style={{ marginBottom: "5px" }}>{profile.username}</h1>
                <p style={{ marginTop: 0, color: "#aaaaaa" }}>
                  @{profile.username}
                </p>

                {/* Follower / Following counts */}
                <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                  <span style={{ color: "#aaaaaa" }}>
                    <strong style={{ color: "white" }}>
                      {profile.followingCount ?? 0}
                    </strong>{" "}
                    Following
                  </span>
                  <span style={{ color: "#aaaaaa" }}>
                    <strong style={{ color: "white" }}>
                      {profile.followerCount ?? 0}
                    </strong>{" "}
                    Followers
                  </span>
                </div>
              </div>

              {/* Right side: Edit Bio for self, Follow/Unfollow for others */}
              {isOwnProfile ? (
                !editMode && (
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
                )
              ) : (
                <button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    backgroundColor: isFollowing ? "#444" : "#058BFE",
                    color: "white",
                    border: "none",
                    borderRadius: "999px",
                    cursor: "pointer",
                    minWidth: "100px",
                  }}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
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
