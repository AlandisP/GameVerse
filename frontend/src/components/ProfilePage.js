// src/components/ProfilePage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import PostObj from "./Post";
import API_URL from "../config/api"; // keep existing config or fallback to http://localhost:8080

export default function ProfilePage() {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();

  const viewer = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const headers = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;

  const [profile, setProfile] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [loading, setLoading] = useState(true);

  const [allPosts, setAllPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]); // array of bookmarked post ids

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setRouteError("");
      setProfile(null);
      setAllPosts([]);
      setBookmarks([]);

      // If route param is missing, fall back to logged in user
      const loggedIn = localStorage.getItem("username");
      const canonical = routeUsername || loggedIn;
      if (!canonical) {
        setRouteError("No username provided and no user logged in.");
        setLoading(false);
        return;
      }
      setProfile({ username: canonical });

      try {
        const postsUrl = `${API_URL || "http://localhost:8080"}/post/getposts`;
        const booksUrl = `${API_URL || "http://localhost:8080"}/post/getbooks`;

        console.log("[ProfilePage] fetching posts from:", postsUrl);
        const [postsRes, booksRes] = await Promise.all([
          axios
            .get(postsUrl, headers ? { headers: headers.headers } : undefined)
            .catch((e) => e),
          axios
            .get(booksUrl, headers ? { headers: headers.headers } : undefined)
            .catch((e) => e),
        ]);

        // Log raw responses for debugging
        console.log(
          "[ProfilePage] postsRes:",
          postsRes && postsRes.status,
          postsRes && postsRes.data,
        );
        console.log(
          "[ProfilePage] booksRes:",
          booksRes && booksRes.status,
          booksRes && booksRes.data,
        );

        const postsData =
          postsRes && postsRes.data && Array.isArray(postsRes.data)
            ? postsRes.data
            : [];
        const booksData =
          booksRes && booksRes.data && Array.isArray(booksRes.data)
            ? booksRes.data
            : [];

        if (cancelled) return;

        setAllPosts(postsData);
        setBookmarks(booksData);
      } catch (err) {
        console.error("ProfilePage fetch error:", err);
        setRouteError("Failed to load profile data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [routeUsername, token]);

  // Derived data
  const postsByUser = allPosts.filter(
    (p) =>
      String(p.user).toLowerCase() ===
      String(profile?.username || "").toLowerCase(),
  );
  const likedByUser = allPosts.filter(
    (p) => p.liked && p.liked[profile?.username],
  );
  // Collect media from posts if any fields exist
  const mediaItems = allPosts.flatMap((p) => {
    if (Array.isArray(p.media)) return p.media;
    if (Array.isArray(p.images)) return p.images;
    if (Array.isArray(p.mediaUrls)) return p.mediaUrls;
    if (p.image) return [p.image];
    if (p.img) return [p.img];
    return [];
  });

  return (
    <div className="page-container">
      <NavBar />
      <div className="main-content" style={{ display: "flex", padding: 0 }}>
        {/* LEFT */}
        <div
          style={{
            width: "360px",
            backgroundColor: "#373737",
            height: "100vh",
            borderRight: "1px solid #000",
            display: "flex",
            flexDirection: "column",
            padding: "40px",
          }}
        >
          <div style={{ color: "white" }}>
            <h2 style={{ margin: 0 }}>
              {profile ? `@${profile.username}` : "Profile"}
            </h2>
            <div style={{ color: "#bdbdbd", marginTop: "8px" }}>
              {loading
                ? "Loading..."
                : routeError
                  ? routeError
                  : "Public profile"}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
              <button
                onClick={() => navigate(`/messages/${profile?.username}`)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#058BFE",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Message
              </button>
            </div>

            <div style={{ marginTop: "28px", color: "#bdbdbd" }}>
              <div>
                <strong>{postsByUser.length}</strong> posts
              </div>
              <div style={{ marginTop: "6px" }}>
                <strong>{mediaItems.length}</strong> media
              </div>
              <div style={{ marginTop: "6px" }}>
                <strong>{likedByUser.length}</strong> liked posts
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#2d2d2d",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #000",
              padding: "50px 20px 18px",
              color: "white",
              fontWeight: 700,
            }}
          >
            {profile ? `@${profile.username}` : "Profile"}
          </div>

          <ProfileTabs
            profileUsername={profile?.username}
            postsByUser={postsByUser}
            likedPosts={likedByUser}
            mediaItems={mediaItems}
            bookmarks={bookmarks}
          />
        </div>
      </div>
    </div>
  );
}

/* Tabs */
function ProfileTabs({
  profileUsername,
  postsByUser,
  likedPosts,
  mediaItems,
  bookmarks,
}) {
  const [tab, setTab] = useState("posts");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 20px",
          borderBottom: "1px solid #000",
        }}
      >
        <button
          onClick={() => setTab("posts")}
          style={tab === "posts" ? activeTabStyle : tabStyle}
        >
          Posts
        </button>
        <button
          onClick={() => setTab("media")}
          style={tab === "media" ? activeTabStyle : tabStyle}
        >
          Media
        </button>
        <button
          onClick={() => setTab("likes")}
          style={tab === "likes" ? activeTabStyle : tabStyle}
        >
          Liked
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 40px 20px 20px", // less left padding
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // force left alignment
        }}
      >
        {tab === "posts" && (
          <div>
            {postsByUser.length === 0 ? (
              <div style={{ color: "#bdbdbd" }}>No posts yet.</div>
            ) : (
              postsByUser.map((p) => {
                const isBook = Array.isArray(bookmarks)
                  ? bookmarks.includes(p.id)
                  : false;
                const commcount = Array.isArray(p.comments)
                  ? p.comments.length
                  : 0;
                return (
                  <PostObj
                    key={p.id}
                    User={p.user}
                    Content={p.text}
                    Likes={p.likes}
                    Liked={p.liked ? p.liked[profileUsername] : false}
                    id={p.id}
                    commcount={commcount}
                    books={isBook}
                    CreatedAt={p.createdAt}
                    CommunityName={p.communityName}
                  />
                );
              })
            )}
          </div>
        )}

        {tab === "media" && (
          <div>
            {mediaItems.length === 0 ? (
              <div style={{ color: "#bdbdbd" }}>
                No media found for this user (your current posts don't include
                media fields).
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "12px",
                }}
              >
                {mediaItems.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#222",
                      height: "140px",
                    }}
                  >
                    {String(m).match(/\.(mp4|webm)$/i) ? (
                      <video
                        src={m}
                        controls
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={m}
                        alt={`media-${i}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "likes" && (
          <div>
            {likedPosts.length === 0 ? (
              <div style={{ color: "#bdbdbd" }}>No liked posts yet.</div>
            ) : (
              likedPosts.map((p) => {
                const isBook = Array.isArray(bookmarks)
                  ? bookmarks.includes(p.id)
                  : false;
                const commcount = Array.isArray(p.comments)
                  ? p.comments.length
                  : 0;
                return (
                  <PostObj
                    key={p.id}
                    User={p.user}
                    Content={p.text}
                    Likes={p.likes}
                    Liked={p.liked ? p.liked[profileUsername] : false}
                    id={p.id}
                    commcount={commcount}
                    books={isBook}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const tabStyle = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid #444",
  backgroundColor: "#2f2f2f",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const activeTabStyle = {
  ...tabStyle,
  border: "1px solid #058BFE",
  backgroundColor: "#2b3a4a",
};
