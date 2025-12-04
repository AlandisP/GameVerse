import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ExplorePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  // accept either key used across your app
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("explore");

  const handleNavClick = (e, path, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    navigate(path);
  };

  const handleLogout = (e) => {
    e?.preventDefault();
    // remove both possible token keys so logout is robust
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchControllerRef = useRef(null);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const tokenLocal =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/posts/explore", {
          headers: tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {},
          signal: controller.signal,
        });

        if (!mounted) return;

        const data = response.data;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          return;
        }

        console.error("Failed to fetch posts:", err);

        if (!mounted) return;

        setError(
          err.response?.data?.message || err.message || "Failed to load posts."
        );

        setPosts([
          {
            id: "demo-1",
            author: "DemoUser",
            content: "Looking for teammates tonight. DM me!",
            createdAt: new Date().toISOString(),
            likes: 2,
            liked: false,
          },
          {
            id: "demo-2",
            author: "GamerGal",
            content: "New patch notes are wild. Who's tried the new map?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            likes: 7,
            liked: false,
          },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleLike = async (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked
                ? Math.max((post.likes || 1) - 1, 0)
                : (post.likes || 0) + 1,
            }
          : post
      )
    );

    try {
      await axios.post(`/api/posts/${encodeURIComponent(postId)}/like`);
    } catch (err) {
      console.error("Failed to update like status", err);
      // rollback toggle on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked
                  ? Math.max((post.likes || 1) - 1, 0)
                  : (post.likes || 0) + 1,
              }
            : post
        )
      );
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      if (searchControllerRef.current) {
        searchControllerRef.current.abort();
      }
      const controller = new AbortController();
      searchControllerRef.current = controller;

      const doSearch = async () => {
        setSearchLoading(true);
        setSearchError(null);

        const tokenLocal =
          localStorage.getItem("authToken") || localStorage.getItem("token");

        try {
          const res = await axios.get("/api/users/search", {
            params: { q: searchQuery },
            headers: tokenLocal
              ? { Authorization: `Bearer ${tokenLocal}` }
              : {},
            signal: controller.signal,
          });

          const data = res.data;
          setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
          if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
            return;
          }
          console.error("User search failed:", err);
          setSearchError(
            err.response?.data?.message || err.message || "Search failed."
          );
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      };

      doSearch();
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (searchControllerRef.current) searchControllerRef.current.abort();
    };
  }, []);

  const PostCard = ({ post }) => {
    const created = new Date(post.createdAt || Date.now());
    const createdStr = created.toLocaleString();

    return (
      <div className="post-card" key={post.id}>
        <div className="post-header">
          <div className="post-author">@{post.author || "Unknown"}</div>
          <div className="post-time">{createdStr}</div>
        </div>

        <div className="post-body">
          <p>{post.content}</p>
        </div>

        <div className="post-actions">
          <button
            className={`like-button ${post.liked ? "liked" : ""}`}
            onClick={() => handleLike(post.id)}
            aria-pressed={!!post.liked}
            type="button"
          >
            👍 {post.likes || 0}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img
                src={require("../images/GameVerse_Logo.png")}
                alt="GameVerse Logo"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <span className="logo-text">GameVerse</span>
          </div>
        </div>

        <div className="nav-items">
          <div className="nav-links">
            <a
              href="/home"
              className={activeTab === "home" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/home", "home")}
            >
              <svg
                className="nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </a>

            <a
              href="/explore"
              className={activeTab === "explore" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/explore", "explore")}
            >
              <svg
                className="nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Explore
            </a>

            <a
              href="/messages"
              className={activeTab === "messages" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/messages", "messages")}
            >
              <svg
                className="nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Messages
            </a>

            <a
              href="/partyfinder"
              className={activeTab === "partyfinder" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/partyfinder", "partyfinder")}
            >
              <svg
                className="nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Party Finder
            </a>

            <a
              href="/communities"
              className={activeTab === "communities" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/communities", "communities")}
            >
              <svg
                className="nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Communities
            </a>

            <a
              href="/profile"
              className={activeTab === "profile" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/profile", "profile")}
            >
              <svg
                className="nav-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </a>
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            className="user-profile"
            type="button"
            onClick={() =>
              navigate(`/profile/${encodeURIComponent(username || "guest")}`)
            }
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>@{username || "Guest"}</span>
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header style={{ marginBottom: 20 }}>
          <h1>Explore</h1>
          <p style={{ color: "#bbb" }}>See what's trending in the community.</p>

          <div style={{ marginTop: 12 }}>
            <input
              type="search"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="user-search-input"
              aria-label="Search users"
            />
            {searchLoading && (
              <span className="search-loading"> Searching…</span>
            )}
          </div>

          {searchQuery && (
            <div className="search-results">
              {searchError && <div className="search-error">{searchError}</div>}

              {!searchLoading && searchResults.length === 0 && !searchError && (
                <div className="search-empty">No users found.</div>
              )}

              <ul>
                {searchResults.map((u) => (
                  <li
                    key={u.username || u.id}
                    className="search-result-item"
                    onClick={() => {
                      const target = u.username || u.id;
                      setSearchQuery("");
                      setSearchResults([]);
                      navigate(`/profile/${encodeURIComponent(target)}`);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const target = u.username || u.id;
                        setSearchQuery("");
                        setSearchResults([]);
                        navigate(`/profile/${encodeURIComponent(target)}`);
                      }
                    }}
                  >
                    <strong>@{u.username || u.name}</strong>
                    {u.displayName && (
                      <span className="muted"> — {u.displayName}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {loading ? (
          <h3>Loading posts…</h3>
        ) : error ? (
          <>
            <h3 style={{ color: "salmon" }}>Unable to load posts.</h3>
            <p style={{ color: "#aaa" }}>{error}</p>
          </>
        ) : posts.length === 0 ? (
          <h3>No posts yet.</h3>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </div>
  );
}

export default ExplorePage;
