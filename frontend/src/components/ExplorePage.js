import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ExplorePage.css";

function ExplorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");

  const handleNavClick = (e, path, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    navigate(path);
  };

  const hanleLogout = () => {
    e.preventDefault();
    localStorage.removeItem("authToken");
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
    const token = localStorage.getItem("authToken");

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!mounted) {
          return;
        }

        const data = response.data;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          return;
        }

        console.error("Failed to fetch posts", err);

        if (!mounted) {
          return;
        }

        setPostsError(error.response?.data?.message || "Failed to load posts.");

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
        if (mounted) {
          setLoading(false);
        }
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
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    try {
      await axios.post(
        `http://localhost:8080/api/posts/${encodeURIComponent(postId)}/like`
      );
    } catch (err) {
      console.error("Failed to update like status", err);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
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

      const performSearch = async () => {
        setSearchLoading(true);
        setSearchError(null);

        const token = localStorage.getItem("authToken");

        try {
          const response = await axios.get("/api/posts/search", {
            params: { q: searchQuery },
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });

          const data = response.data;
          setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
          if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
            return;
          }
          console.error("Search failed", err);
          setSearchError(err.response?.data?.message || "Search failed.");
        } finally {
          setSearchLoading(false);
        }
      };

      performSearch();
    }, 500);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (searchControllerRef.current) {
        searchControllerRef.current.abort();
      }
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
            <a>
              href="/home" className={activeTab === "home" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/home", "home")}
            </a>

            <a>
              href="/explore" className=
              {activeTab === "explore" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/explore", "explore")}
            </a>

            <a>
              href="/messages" className=
              {activeTab === "messages" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/messages", "messages")}
            </a>

            <a>
              href="/partyfinder" className=
              {activeTab === "partyfinder" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/partyfinder", "partyfinder")}
            </a>

            <a>
              href="/communities" className=
              {activeTab === "communities" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/communities", "communities")}
            </a>

            <a>
              href="/profile" className=
              {activeTab === "profile" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/profile", "profile")}
            </a>
          </div>

          <div style={{ marginTop: 20 }}>
            <button>
              onClick={handleLogout}
              className="logout-button" type="button"
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header style={{ marginBottom: 20 }}>
          <h1>Explore</h1>
          <p style={{ color: "#bbb" }}>See what's trending in the community.</p>

          {/* Search input */}
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

          {/* Search results dropdown */}
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
                      // navigate to user's profile
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

        {/* Posts area */}
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
