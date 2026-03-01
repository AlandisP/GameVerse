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
  const [displayPosts, setDisplayPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("trending");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const getTimestamp = (p) => {
    const t = p.createdAt ?? p.timestamp ?? p.date;
    return t ? new Date(t).getTime() : 0;
  };

  const trendingScore = (p) => {
    const likes = Number(p.likes || 0);
    const ageHours = (Date.now() - getTimestamp(p)) / (1000 * 60 * 60);
    return likes + 10 / (1 + ageHours);
  };

  const sortPosts = (data) => {
    if (mode === "newest") {
      return [...data].sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }
    if (mode === "random") {
      return shuffle(data);
    }
    return [...data].sort((a, b) => trendingScore(b) - trendingScore(a));
  };

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await axios.get(
          `${API_URL || "http://localhost:8080"}/post/getposts`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setPosts(data);
        setDisplayPosts(sortPosts(data));
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load posts.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    setDisplayPosts(sortPosts(posts));
  }, [mode]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const token = getToken();
        const res = await axios.get(
          `${API_URL || "http://localhost:8080"}/users/matches`,
          {
            params: { text: searchQuery },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  const mapToPostObjProps = (p) => {
    const user = p.user ?? p.username ?? "Unknown";
    const content = p.text ?? p.content ?? "";
    const likes = Number(p.likes || 0);
    const currentUser = localStorage.getItem("username");
    const liked =
      p.liked && typeof p.liked === "object"
        ? Boolean(p.liked[currentUser])
        : Boolean(p.liked);

    return {
      User: user,
      Content: content,
      Likes: likes,
      Liked: liked,
      id: p.id,
    };
  };

  return (
    <div className="page-container">
      <NavBar />
      <div className="main-content" style={{ display: "flex", padding: 0 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 350,
            backgroundColor: "#373737",
            height: "100vh",
            borderRight: "1px solid black",
          }}
        >
          <div style={{ padding: "50px 40px 10px" }}>
            <h1 style={{ color: "white", margin: 0 }}>Explore</h1>
          </div>

          <div style={{ padding: 20 }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 25,
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={searchIcon}
                alt="search"
                style={{ width: 20, marginRight: 10 }}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "none", outline: "none", width: "100%" }}
              />
            </div>

            {searchResults.map((u) => (
              <div
                key={u.username || u.id}
                style={{
                  padding: 8,
                  marginTop: 6,
                  backgroundColor: "#3b3b3b",
                  borderRadius: 8,
                  color: "white",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/profile/${u.username || u.id}`)}
              >
                {u.username || u.id}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#2d2d2d",
            height: "100vh",
            overflowY: "auto",
            padding: 20,
            color: "white",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ padding: 6, borderRadius: 6 }}
            >
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="random">Random</option>
            </select>
          </div>

          {loading ? (
            <h3>Loading posts…</h3>
          ) : error ? (
            <div>{error}</div>
          ) : displayPosts.length === 0 ? (
            <div>No posts found.</div>
          ) : (
            displayPosts.map((post) => (
              <PostObj key={post.id} {...mapToPostObjProps(post)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ExplorePage;
