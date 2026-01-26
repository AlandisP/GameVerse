import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import searchIcon from "../images/search.png";
import API_URL from "../config/api";
import PostObj from "./Post";

function ExplorePage() {
  const navigate = useNavigate();
  const getToken = () =>
    localStorage.getItem("authToken") || localStorage.getItem("token") || null;

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

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getPostTimestamp(post) {
    const t =
      post.createdAt ??
      post.created_at ??
      post.timestamp ??
      post.time ??
      post.date;
    if (!t) return null;
    const d = new Date(t);
    return Number.isFinite(d.getTime()) ? d.getTime() : null;
  }

  function trendingScore(post, now = Date.now()) {
    const likes = Number(post.likes || 0);
    const ts = getPostTimestamp(post);
    let recencyHours = ts
      ? Math.max(0, (now - ts) / (1000 * 60 * 60))
      : 24 * 365;
    const recencyScore = 10 / (1 + recencyHours);
    return likes + recencyScore;
  }

  function pickTrending(postsArray, n = 20) {
    const now = Date.now();
    return postsArray
      .map((p) => ({ p, score: trendingScore(p, now) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map((x) => x.p);
  }

  function pickRandomFrom(allPosts, excludeSet = new Set(), m = 30) {
    const pool = allPosts.filter((p) => !excludeSet.has(p.id));
    return shuffleArray(pool).slice(0, m);
  }

  function combineTrendingAndRandom(trending, random) {
    const out = [];
    const maxLen = Math.max(trending.length, random.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < trending.length) out.push(trending[i]);
      if (i < random.length) out.push(random[i]);
    }
    return out;
  }

  function mapToPostObjProps(p) {
    const user = p.user ?? p.author ?? p.authorName ?? p.username ?? "Unknown";
    const content = p.text ?? p.content ?? p.body ?? "";
    const likes = Number.isFinite(Number(p.likes)) ? Number(p.likes) : 0;
    let liked = false;
    const currentUser = localStorage.getItem("username");
    if (p.liked && typeof p.liked === "object") {
      const val = p.liked[currentUser];
      liked = Boolean(val);
    } else {
      liked = Boolean(p.liked);
    }
    return {
      User: user,
      Content: content,
      Likes: likes,
      Liked: liked,
      id: p.id,
    };
  }

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    postsAbortRef.current = controller;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/post/getposts`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) return;
        const data = Array.isArray(response.data) ? response.data : [];

        const trending = pickTrending(data, 20);
        const exclude = new Set(trending.map((p) => p.id));
        const random = pickRandomFrom(data, exclude, 30);
        const combined = combineTrendingAndRandom(trending, random);

        setPosts(combined.slice(0, 50));
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        if (!mounted) return;
        setError(
          err.response?.data?.message || err.message || "Failed to load posts.",
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
          : post,
      ),
    );

    try {
      const token = getToken();
      await axios.post(
        `${API_URL}/post/likepost`,
        { id: postId },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
    } catch {
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
            : post,
        ),
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
      const doSearch = async () => {
        setSearchLoading(true);
        setSearchError(null);

        try {
          const token = getToken();
          const res = await axios.get(`${API_URL}/users/matches`, {
            params: { text: searchQuery },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          setSearchError(
            err.response?.data?.message || err.message || "Search failed.",
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

  return (
    <div className="page-container">
      <NavBar />
      <div className="main-content" style={{ display: "flex", padding: 0 }}>
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
            <h1 style={{ color: "white", fontSize: "32px", margin: 0 }}>
              Explore
            </h1>
          </div>

          <div style={{ padding: "20px" }}>
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

            {searchLoading && (
              <small style={{ color: "#ddd" }}>Searching…</small>
            )}

            {searchQuery && (
              <div
                style={{
                  marginTop: 8,
                  maxHeight: 300,
                  overflowY: "auto",
                  color: "white",
                }}
              >
                {searchError && (
                  <div style={{ color: "salmon" }}>{searchError}</div>
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
              <div style={{ color: "salmon" }}>{error}</div>
            ) : posts.length === 0 ? (
              <div>No posts found.</div>
            ) : (
              posts.map((post) => {
                const props = mapToPostObjProps(post);
                return (
                  <PostObj
                    key={props.id || Math.random().toString(36).slice(2)}
                    {...props}
                  />
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExplorePage;
