// ExplorePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ExplorePage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const getToken = () =>
    localStorage.getItem("authToken") || localStorage.getItem("token") || null;

  const [activeTab, setActiveTab] = useState("explore");

  // posts state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // refs for cancellation & debounce
  const postsAbortRef = useRef(null);
  const searchControllerRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const handleNavClick = (e, path, tab) => {
    e?.preventDefault();
    setActiveTab(tab);
    navigate(path);
  };

  const handleLogout = (e) => {
    e?.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // fetch explore posts
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    postsAbortRef.current = controller;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      const token = getToken();

      try {
        const response = await axios.get("/api/posts/explore", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!mounted) return;
        const data = response.data;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          // request was aborted
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
      if (postsAbortRef.current) postsAbortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // optimistic like toggle with rollback on error
  const handleToggleLike = async (postId) => {
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
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err) {
      console.error("Failed to update like status", err);
      // rollback
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

  // debounced user search (example uses /api/users/search)
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // clear previous debounce
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      // abort any previous search
      if (searchControllerRef.current) searchControllerRef.current.abort();

      const controller = new AbortController();
      searchControllerRef.current = controller;

      const doSearch = async () => {
        setSearchLoading(true);
        setSearchError(null);
        const token = getToken();

        try {
          const res = await axios.get("/api/users/search", {
            params: { q: searchQuery },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          });

          const data = res.data;
          setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
          if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError")
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
      // do not abort here — abort is handled when starting a new search or component unmount
    };
  }, [searchQuery]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (postsAbortRef.current) postsAbortRef.current.abort();
      if (searchControllerRef.current) searchControllerRef.current.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  return (
    <div className="explore-page">
      <nav className="sidebar">
        <div className="nav-items">
          <div className="nav-links">
            <a
              href="/home"
              className={activeTab === "home" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/home", "home")}
            >
              {/* svg + label */}
              Home
            </a>

            <a
              href="/explore"
              className={activeTab === "explore" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/explore", "explore")}
            >
              Explore
            </a>

            <a
              href="/messages"
              className={activeTab === "messages" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/messages", "messages")}
            >
              Messages
            </a>

            <a
              href="/partyfinder"
              className={activeTab === "partyfinder" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/partyfinder", "partyfinder")}
            >
              Party Finder
            </a>

            <a
              href="/communities"
              className={activeTab === "communities" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/communities", "communities")}
            >
              Communities
            </a>

            <a
              href="/profile"
              className={activeTab === "profile" ? "active" : ""}
              onClick={(e) => handleNavClick(e, "/profile", "profile")}
            >
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
            <span>@{username || "Guest"}</span>
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="content">
        <header>
          <h1>Explore</h1>
          <p style={{ color: "#bbb" }}>See what's trending in the community.</p>

          <div style={{ marginTop: 12 }}>
            <input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchLoading && <small>Searching…</small>}
          </div>

          {searchQuery && (
            <div className="search-results">
              {searchError && <div className="search-error">{searchError}</div>}
              {searchResults.map((u) => (
                <div
                  key={u.username || u.id}
                  className="search-result-item"
                  onClick={() => {
                    const target = u.username || u.id;
                    setSearchQuery("");
                    setSearchResults([]);
                    navigate(`/profile/${encodeURIComponent(target)}`);
                  }}
                >
                  <div>{u.displayName || u.username || u.id}</div>
                </div>
              ))}
            </div>
          )}
        </header>

        <section className="posts-area">
          {loading ? (
            <h3>Loading posts…</h3>
          ) : error ? (
            <div className="error">{error}</div>
          ) : posts.length === 0 ? (
            <div>No posts found.</div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="post">
                <div className="post-header">
                  <strong>{post.authorName || post.author || "Unknown"}</strong>
                </div>
                <div className="post-body">{post.content}</div>
                <div className="post-actions">
                  <button onClick={() => handleToggleLike(post.id)}>
                    {post.liked ? "Unlike" : "Like"} ({post.likes || 0})
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default ExplorePage;
