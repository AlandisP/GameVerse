import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import searchIcon from "../images/search.png";
import API_URL from "../config/api";
import PostObj from "./Post";
import "./ExplorePage.css";

const BASE_URL = API_URL || "http://localhost:8080";

function ExplorePage() {
  const navigate = useNavigate();

  const getToken = () =>
    localStorage.getItem("authToken") || localStorage.getItem("token") || null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);
  const [mode, setMode] = useState("trending");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("all"); // all | users | posts
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const searchDebounceRef = useRef(null);

  const getTimestamp = (p) => {
    const t = p?.createdAt ?? p?.timestamp ?? p?.date;
    const parsed = t ? new Date(t).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const trendingScore = (p) => {
    const likes = Number(p?.likes || 0);
    const ageHours = (Date.now() - getTimestamp(p)) / (1000 * 60 * 60);
    return likes + 10 / (1 + Math.max(ageHours, 0));
  };

  const sortPosts = (data) => {
    if (mode === "newest") {
      return [...data].sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }
    if (mode === "random") {
      return [...data].sort(() => Math.random() - 0.5);
    }
    return [...data].sort((a, b) => trendingScore(b) - trendingScore(a));
  };

  const displayPosts = useMemo(() => sortPosts(posts), [posts, mode]);

  const normalizePostsResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.posts)) return data.posts;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const normalizeText = (value) => String(value ?? "").toLowerCase();

  const postMatchesQuery = (post, query) => {
    const q = normalizeText(query);
    const fields = [
      post?.text,
      post?.content,
      post?.title,
      post?.user,
      post?.username,
      post?.author,
      post?.communityName,
      post?.tag,
    ];
    return fields.some((field) => normalizeText(field).includes(q));
  };

  const filterPostsLocally = (query) => {
    if (!query.trim()) return [];
    return posts.filter((post) => postMatchesQuery(post, query));
  };

  const mapToPostObjProps = (p) => {
    const user = p?.user ?? p?.username ?? p?.author ?? "Unknown";
    const content = p?.text ?? p?.content ?? "";
    const likes = Number(p?.likes || 0);
    const currentUser = localStorage.getItem("username");
    const liked =
      p?.liked && typeof p.liked === "object"
        ? Boolean(p.liked[currentUser])
        : Boolean(p?.liked);

    return {
      User: user,
      Content: content,
      Likes: likes,
      Liked: liked,
      id: p?.id,
    };
  };

  const getUserLabel = (u) => u?.username || u?.name || u?.id || "Unknown";
  const getUserRoute = (u) => u?.username || u?.id || "";

  const getUserInitials = (u) => {
    const label = getUserLabel(u).trim();
    if (!label) return "?";
    return label
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2);
  };

  const getUserImageSrc = (u) => {
    const raw =
      u?.pfp || u?.profilePicture || u?.avatar || u?.imageUrl || u?.photo || "";

    if (!raw) return "";

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    return `${BASE_URL}${raw}`;
  };

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      setLoading(true);
      setFeedError(null);
      try {
        const token = getToken();
        const res = await axios.get(`${BASE_URL}/post/getposts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setPosts(data);
      } catch (err) {
        if (!mounted) return;
        setFeedError("Failed to load posts.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();

    if (!q) {
      setUserResults([]);
      setPostResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let active = true;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);

      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const tasks = [];

        if (searchScope !== "posts") {
          tasks.push(
            axios
              .get(`${BASE_URL}/users/matches`, {
                params: { text: q },
                headers,
              })
              .then((res) => ({
                type: "users",
                data: Array.isArray(res.data)
                  ? res.data
                  : Array.isArray(res.data?.data)
                    ? res.data.data
                    : [],
              }))
              .catch(() => ({ type: "users", data: [] })),
          );
        }

        if (searchScope !== "users") {
          tasks.push(
            axios
              .get(`${BASE_URL}/post/matches`, {
                params: { text: q },
                headers,
              })
              .then((res) => ({
                type: "posts",
                data: normalizePostsResponse(res.data),
              }))
              .catch(() => ({
                type: "posts",
                data: filterPostsLocally(q),
              })),
          );
        }

        const results = await Promise.all(tasks);
        if (!active) return;

        const foundUsers = results.find((r) => r.type === "users")?.data || [];
        const foundPosts = results.find((r) => r.type === "posts")?.data || [];

        setUserResults(foundUsers);
        setPostResults(foundPosts);
      } catch (err) {
        if (!active) return;
        setSearchError("Search failed.");
        setUserResults([]);
        setPostResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, searchScope, posts]);

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="page-container explore-page">
      <NavBar />

      <div className="main-content explore-main-content">
        <div className="explore-content">
          <aside className="explore-sidebar-box">
            <div>
              <h1 className="explore-title">Explore</h1>
              <p className="explore-subtitle">
                Search people or posts, then switch between trending, newest,
                and random.
              </p>
            </div>

            <div className="filter-buttons">
              <button
                type="button"
                className={`filter-btn ${searchScope === "all" ? "active" : ""}`}
                onClick={() => setSearchScope("all")}
              >
                All results
              </button>
              <button
                type="button"
                className={`filter-btn ${searchScope === "users" ? "active" : ""}`}
                onClick={() => setSearchScope("users")}
              >
                Users only
              </button>
              <button
                type="button"
                className={`filter-btn ${searchScope === "posts" ? "active" : ""}`}
                onClick={() => setSearchScope("posts")}
              >
                Posts only
              </button>
            </div>

            <div className="sidebar-tip">
              <strong>Tip:</strong> Clear the search box to return to the main
              feed.
            </div>
          </aside>

          <section className="explore-main-column">
            <div className="explore-search-box">
              <div className="explore-search-row">
                <div className="explore-search-input">
                  <img src={searchIcon} alt="search" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users or posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="sort-wrap">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="trending">Trending</option>
                    <option value="newest">Newest</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="explore-feed-box">
              {hasQuery ? (
                <div className="search-results-area">
                  <div className="results-header">
                    <div>
                      <h2>Search results</h2>
                      <p>
                        {searchScope === "all"
                          ? "Showing both users and posts"
                          : searchScope === "users"
                            ? "Showing users only"
                            : "Showing posts only"}
                      </p>
                    </div>
                  </div>

                  {searchLoading ? (
                    <div className="empty-state">Searching…</div>
                  ) : searchError ? (
                    <div className="error-state">{searchError}</div>
                  ) : (
                    <>
                      {(searchScope === "all" || searchScope === "users") && (
                        <section className="result-section">
                          <div className="section-header">
                            <h3>Users</h3>
                            <span>{userResults.length} found</span>
                          </div>

                          {userResults.length === 0 ? (
                            <div className="empty-state">No users found.</div>
                          ) : (
                            <div className="user-grid">
                              {userResults.map((u) => {
                                const route = getUserRoute(u);
                                const displayName =
                                  u?.name || u?.username || "Unknown";
                                const handle =
                                  u?.username &&
                                  u?.name &&
                                  u.username !== u.name
                                    ? `@${u.username}`
                                    : null;
                                const imageSrc = getUserImageSrc(u);

                                return (
                                  <button
                                    key={u?.username || u?.id}
                                    type="button"
                                    className="user-card"
                                    onClick={() =>
                                      navigate(`/profile/${route}`)
                                    }
                                  >
                                    <div className="user-avatar">
                                      {imageSrc ? (
                                        <img
                                          src={imageSrc}
                                          alt={getUserLabel(u)}
                                          className="user-avatar-img"
                                        />
                                      ) : (
                                        getUserInitials(u)
                                      )}
                                    </div>

                                    <div className="user-info">
                                      <div className="user-topline">
                                        <div className="user-name">
                                          {displayName}
                                        </div>
                                        {handle && (
                                          <div className="user-handle">
                                            {handle}
                                          </div>
                                        )}
                                      </div>
                                      <div className="user-hint">
                                        Open profile
                                      </div>
                                    </div>

                                    <div className="user-chevron">›</div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </section>
                      )}

                      {(searchScope === "all" || searchScope === "posts") && (
                        <section className="result-section">
                          <div className="section-header">
                            <h3>Posts</h3>
                            <span>{postResults.length} found</span>
                          </div>

                          {postResults.length === 0 ? (
                            <div className="empty-state">No posts found.</div>
                          ) : (
                            <div className="post-list">
                              {postResults.map((post) => (
                                <div key={post?.id} className="post-wrapper">
                                  <PostObj {...mapToPostObjProps(post)} />
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="feed-area">
                  <div className="results-header">
                    <div>
                      <h2>Trending feed</h2>
                      <p>Browse the latest posts from the community.</p>
                    </div>
                    <span>{displayPosts.length} posts</span>
                  </div>

                  {loading ? (
                    <div className="empty-state">Loading posts…</div>
                  ) : feedError ? (
                    <div className="error-state">{feedError}</div>
                  ) : displayPosts.length === 0 ? (
                    <div className="empty-state">No posts found.</div>
                  ) : (
                    <div className="post-list">
                      {displayPosts.map((post) => (
                        <div key={post?.id} className="post-wrapper">
                          <PostObj {...mapToPostObjProps(post)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExplorePage;
