// src/components/ExplorePage.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../config/api"; // if api.get doesn't exist, we use axios in fetchPosts below
import NavBar from "./NavBar";
import searchIcon from "../images/search.png"; // same icon path used in MessagePage
import API_URL from '../config/api';

function ExplorePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  // local token getter (restores previous fix)
  const getToken = () =>
    localStorage.getItem("authToken") || localStorage.getItem("token") || null;

  const [activeTab, setActiveTab] = useState("explore");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const postsAbortRef = useRef(null);
  const searchControllerRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const handleNavClick = (e, path, tab) => {
    e?.preventDefault();
    setActiveTab(tab);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    postsAbortRef.current = controller;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        console.log("fetchPosts token:", token);

        // Use axios.get for compatibility (in case `api` isn't an axios instance)
        const response = await axios.get("/api/posts/explore", {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) return;
        const data = response.data;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.error("Failed to fetch posts:", err);
        if (!mounted) return;
        setError(
          err.response?.data?.message || err.message || "Failed to load posts."
        );
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

  const handleToggleLike = async (postId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
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
      const token = getToken();
      await axios.post(
        `/api/posts/${encodeURIComponent(postId)}/like`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
    } catch (err) {
      console.error("Failed to update like status", err);
      // revert optimistic update on error
      setPosts((prev) =>
        prev.map((post) =>
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
    if (!searchQuery) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      if (searchControllerRef.current) searchControllerRef.current.abort();

      const controller = new AbortController();
      searchControllerRef.current = controller;

      const doSearch = async () => {
        setSearchLoading(true);
        setSearchError(null);

        try {
          const token = getToken();
          const res = await axios.get(`${API_URL}/users/matches`, {
            params: { text: searchQuery },
            // headers: token ? { Authorization: `Bearer ${token}` } : {},
            // signal: controller.signal,
          });

          const data = res.data;
          setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
          if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
            return;
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
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (postsAbortRef.current) postsAbortRef.current.abort();
      if (searchControllerRef.current) searchControllerRef.current.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  return (
    <div className="page-container">
      <NavBar />

      <div className="main-content" style={{ display: "flex", padding: 0 }}>
        {/* LEFT SIDEBAR (holds search) */}
        <div
          style={{
            width: "350px",
            backgroundColor: "#373737",
            height: "100vh",
            borderRight: "1px solid #000000ff",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #000000ff",
              paddingBottom: "10px",
              paddingTop: "50px",
              paddingLeft: "40px",
            }}
          >
            <h1
              style={{
                color: "white",
                fontSize: "32px",
                margin: "0",
              }}
            >
              Explore
            </h1>
          </div>

          <div style={{ padding: "20px" }}>
            {/* Search pill that matches MessagePage */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "25px",
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <img
                src={searchIcon}
                alt="search"
                style={{ width: "20px", marginRight: "10px" }}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  width: "100%",
                }}
              />
            </div>

            {/* show small searching text */}
            {searchLoading && (
              <small style={{ color: "#ddd" }}>Searching…</small>
            )}

            {/* Search results (dropdown style) */}
            {searchQuery && (
              <div
                className="search-results"
                style={{
                  marginTop: 8,
                  maxHeight: 300,
                  overflowY: "auto",
                  color: "white",
                }}
              >
                {searchError && (
                  <div className="search-error" style={{ color: "salmon" }}>
                    {searchError}
                  </div>
                )}
                {searchResults.map((u) => (
                  <div
                    key={u.username || u.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor: "#3b3b3b",
                      marginBottom: 6,
                    }}
                    onClick={() => {
                      const target = u.username || u.id;
                      setSearchQuery("");
                      setSearchResults([]);
                      navigate(`/profile/${encodeURIComponent(target)}`);
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {u.displayName || u.username || u.id}
                    </div>
                    {u.username && (
                      <div style={{ fontSize: 12, color: "#bbb" }}>
                        @{u.username}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: content area (posts) */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#2d2d2d",
            height: "100vh",
            overflowY: "auto",
            padding: "20px",
            color: "white",
          }}
        >
          <p style={{ color: "#bbb", marginTop: 4 }}>
            See what's trending in the community.
          </p>

          <section className="posts-area" style={{ marginTop: 16 }}>
            {loading ? (
              <h3>Loading posts…</h3>
            ) : error ? (
              <div className="error" style={{ color: "salmon" }}>
                {error}
              </div>
            ) : posts.length === 0 ? (
              <div>No posts found.</div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  style={{
                    marginBottom: 12,
                    background: "#3a3a3a",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <div className="post-header">
                    <strong>
                      {post.authorName || post.author || "Unknown"}
                    </strong>
                  </div>
                  <div className="post-body" style={{ marginTop: 8 }}>
                    {post.content}
                  </div>
                  <div className="post-actions" style={{ marginTop: 8 }}>
                    <button onClick={() => handleToggleLike(post.id)}>
                      {post.liked ? "Unlike" : "Like"} ({post.likes || 0})
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExplorePage;
