import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import logo from "../images/search.png";
import API_URL from "../config/api";

import { db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  updateDoc,
  writeBatch,
  getDocs,
  limit,
} from "firebase/firestore";

function getConversationId(user1, user2) {
  return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
}

function getOtherUser(participants, me) {
  return participants?.find((p) => p !== me) || "";
}

function getConversationPreviewText(convo) {
  return convo.lastMessageText || convo.lastMessage || "";
}

function getConversationLastMessageId(convo) {
  return convo?.lastMessageId || "";
}

function MessagePage() {
  const { receiverUsername } = useParams();
  const navigate = useNavigate();

  const sender = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [activeConversationId, setActiveConversationId] = useState("");
  const [activeReceiver, setActiveReceiver] = useState("");

  const [search, setSearch] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");

  // New message composer state
  const [isComposing, setIsComposing] = useState(false);
  const [newDmUsername, setNewDmUsername] = useState("");
  const [composeError, setComposeError] = useState("");

  // URL param invalid state
  const [routeError, setRouteError] = useState("");

  async function resolveUsername(username) {
    const raw = (username || "").trim();
    if (!raw) return { exists: false, canonical: "" };

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    async function fetchProfile(u) {
      return axios.get(`${API_URL}/profile/${encodeURIComponent(u)}`, headers ? { headers } : undefined);
    }

    // Try typed first, then lowercase fallback (case-sensitive backends)
    try {
      const res = await fetchProfile(raw);

      // Defensive: if API returns 200 with no profile
      if (!res?.data || !res.data.username) return { exists: false, canonical: "" };

      return { exists: true, canonical: res.data.username };
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          const res2 = await fetchProfile(raw.toLowerCase());
          if (!res2?.data || !res2.data.username) return { exists: false, canonical: "" };
          return { exists: true, canonical: res2.data.username };
        } catch (err2) {
          if (err2?.response?.status === 404) return { exists: false, canonical: "" };
          return { exists: false, canonical: "", error: "verify_failed" };
        }
      }
      return { exists: false, canonical: "", error: "verify_failed" };
    }
  }

  // ✅ IMPORTANT: Validate receiverUsername from URL before creating convo
  useEffect(() => {
    let cancelled = false;

    async function initFromRoute() {
      setRouteError("");

      if (!sender || !receiverUsername) return;

      // Block self-DM
      if (receiverUsername.toLowerCase() === sender.toLowerCase()) {
        setRouteError("You can't message yourself.");
        setActiveConversationId("");
        setActiveReceiver("");
        setMessages([]);
        return;
      }

      const result = await resolveUsername(receiverUsername);

      if (cancelled) return;

      if (!result.exists) {
        setRouteError(
          result.error ? "Couldn't verify that username right now." : "That username doesn't exist."
        );
        setActiveConversationId("");
        setActiveReceiver("");
        setMessages([]);
        return;
      }

      const canonicalReceiver = result.canonical;
      const convoId = getConversationId(sender, canonicalReceiver);

      setActiveConversationId(convoId);
      setActiveReceiver(canonicalReceiver);

      // Ensure conversation doc exists so it shows in inbox immediately
      await setDoc(
        doc(db, "conversations", convoId),
        {
          participants: [sender, canonicalReceiver],
          updatedAt: serverTimestamp(),
          lastMessageText: "",
          lastMessageAt: null,
          lastMessageSender: "",
          lastMessageId: "",
          // legacy (optional)
          lastMessage: "",
          lastSender: "",
        },
        { merge: true }
      );
    }

    initFromRoute();

    return () => {
      cancelled = true;
    };
  }, [sender, receiverUsername, token]);

  // Load inbox conversation list
  useEffect(() => {
    if (!sender) return;

    const inboxQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", sender),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(inboxQuery, (snapshot) => {
      const convos = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setConversations(convos);
    });

    return () => unsub();
  }, [sender]);

  const filteredConversations = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return conversations;

    return conversations.filter((c) => {
      const other = getOtherUser(c.participants, sender).toLowerCase();
      return other.includes(s);
    });
  }, [conversations, search, sender]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    const q = query(
      collection(db, "conversations", activeConversationId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(list);
    });

    return () => unsub();
  }, [activeConversationId]);

  async function recomputeConversationLastMessage(convoId) {
    const msgsRef = collection(db, "conversations", convoId, "messages");
    const qLast = query(msgsRef, orderBy("timestamp", "desc"), limit(25));
    const snap = await getDocs(qLast);

    const next = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .find((m) => !m.isDeleted);

    const convoRef = doc(db, "conversations", convoId);

    if (!next) {
      await updateDoc(convoRef, {
        lastMessageText: "",
        lastMessageAt: null,
        lastMessageSender: "",
        lastMessageId: "",
        updatedAt: serverTimestamp(),
        // legacy
        lastMessage: "",
        lastSender: "",
      });
      return;
    }

    await updateDoc(convoRef, {
      lastMessageText: next.content || "",
      lastMessageAt: next.timestamp || null,
      lastMessageSender: next.sender || "",
      lastMessageId: next.id,
      updatedAt: serverTimestamp(),
      // legacy
      lastMessage: next.content || "",
      lastSender: next.sender || "",
    });
  }

  async function sendMessage() {
    const text = messageInput.trim();
    if (!text || !sender || !activeReceiver) return;

    const convoId =
      activeConversationId || getConversationId(sender, activeReceiver);

    if (!activeConversationId) setActiveConversationId(convoId);

    const convoRef = doc(db, "conversations", convoId);
    const msgRef = doc(collection(db, "conversations", convoId, "messages"));

    const batch = writeBatch(db);

    batch.set(
      convoRef,
      {
        participants: [sender, activeReceiver],
        updatedAt: serverTimestamp(),
        lastMessageText: text,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: sender,
        lastMessageId: msgRef.id,
        // legacy
        lastMessage: text,
        lastSender: sender,
      },
      { merge: true }
    );

    batch.set(msgRef, {
      sender,
      receiver: activeReceiver,
      content: text,
      timestamp: serverTimestamp(),
      editedAt: null,
      isDeleted: false,
    });

    await batch.commit();
    setMessageInput("");
  }

  async function editMessage(msg) {
    const text = editingText.trim();
    if (!text || !activeConversationId) return;

    const msgRef = doc(
      db,
      "conversations",
      activeConversationId,
      "messages",
      msg.id
    );

    await updateDoc(msgRef, {
      content: text,
      editedAt: serverTimestamp(),
    });

    const convo = conversations.find((c) => c.id === activeConversationId);
    if (getConversationLastMessageId(convo) === msg.id) {
      await updateDoc(doc(db, "conversations", activeConversationId), {
        lastMessageText: text,
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
    }

    setEditingId("");
    setEditingText("");
  }

  async function deleteMessage(msg) {
    if (!activeConversationId) return;

    const msgRef = doc(
      db,
      "conversations",
      activeConversationId,
      "messages",
      msg.id
    );

    await updateDoc(msgRef, {
      isDeleted: true,
      content: "",
      deletedAt: serverTimestamp(),
    });

    const convo = conversations.find((c) => c.id === activeConversationId);
    if (getConversationLastMessageId(convo) === msg.id) {
      await recomputeConversationLastMessage(activeConversationId);
    }

    if (editingId === msg.id) {
      setEditingId("");
      setEditingText("");
    }
  }

  async function startNewConversation() {
    const typed = newDmUsername.trim();

    if (!sender) return;
    if (!typed) {
      setComposeError("Enter a username.");
      return;
    }
    if (typed.toLowerCase() === sender.toLowerCase()) {
      setComposeError("You can't message yourself.");
      return;
    }

    setComposeError("");

    const result = await resolveUsername(typed);
    if (!result.exists) {
      setComposeError(
        result.error ? "Couldn't verify username right now. Try again." : "That username doesn't exist."
      );
      return;
    }

    const canonicalTarget = result.canonical;
    const convoId = getConversationId(sender, canonicalTarget);

    await setDoc(
      doc(db, "conversations", convoId),
      {
        participants: [sender, canonicalTarget],
        updatedAt: serverTimestamp(),
        lastMessageText: "",
        lastMessageAt: null,
        lastMessageSender: "",
        lastMessageId: "",
        // legacy
        lastMessage: "",
        lastSender: "",
      },
      { merge: true }
    );

    setActiveConversationId(convoId);
    setActiveReceiver(canonicalTarget);
    navigate(`/messages/${canonicalTarget}`);

    setIsComposing(false);
    setNewDmUsername("");
    setEditingId("");
    setEditingText("");
  }

  function openConversation(convo) {
    const other = getOtherUser(convo.participants, sender);
    navigate(`/messages/${other}`);
    setActiveConversationId(convo.id);
    setActiveReceiver(other);
    setEditingId("");
    setEditingText("");
    setRouteError("");
  }

  return (
    <div className="page-container">
      <NavBar />
      <div className="main-content" style={{ display: "flex", padding: 0 }}>
        {/* LEFT SIDEBAR */}
        <div
          style={{
            width: "350px",
            backgroundColor: "#373737",
            height: "100vh",
            borderRight: "1px solid #000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #000",
              padding: "50px 0 10px 40px",
            }}
          >
            <h1 style={{ color: "white", margin: 0 }}>Messages</h1>

            <button
              onClick={() => {
                setIsComposing((v) => !v);
                setComposeError("");
                setNewDmUsername("");
              }}
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#058BFE",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              New message
            </button>
          </div>

          {isComposing ? (
            <div style={{ padding: "12px 20px" }}>
              <div
                style={{
                  backgroundColor: "#2f2f2f",
                  border: "1px solid #444",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "white",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                  Start a DM
                </div>

                <input
                  value={newDmUsername}
                  onChange={(e) => setNewDmUsername(e.target.value)}
                  placeholder="Enter username (exact)"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    outline: "none",
                    backgroundColor: "#1f1f1f",
                    color: "white",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startNewConversation();
                  }}
                />

                {composeError ? (
                  <div
                    style={{
                      color: "#ffb3b3",
                      marginTop: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {composeError}
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={startNewConversation}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#4A90E2",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Start
                  </button>

                  <button
                    onClick={() => {
                      setIsComposing(false);
                      setComposeError("");
                      setNewDmUsername("");
                    }}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #444",
                      backgroundColor: "transparent",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ padding: "20px" }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "25px",
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={logo}
                alt="search"
                style={{ width: "20px", marginRight: "10px" }}
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", width: "100%" }}
              />
            </div>
          </div>

          {/* Conversation List */}
          <div style={{ overflowY: "auto", padding: "0 10px 20px 10px" }}>
            {filteredConversations.map((c) => {
              const other = getOtherUser(c.participants, sender);
              const isActive = c.id === activeConversationId;
              const preview = getConversationPreviewText(c);

              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    marginBottom: "8px",
                    borderRadius: "12px",
                    border: isActive ? "1px solid #058BFE" : "1px solid #444",
                    backgroundColor: isActive ? "#2b3a4a" : "#2f2f2f",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{other}</div>
                  <div
                    style={{
                      color: "#bdbdbd",
                      fontSize: "0.9rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {preview || "No messages yet."}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#2d2d2d",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: "1px solid #000",
              padding: "50px 20px 18px",
              color: "white",
              fontWeight: 700,
            }}
          >
            {activeReceiver ? `@${activeReceiver}` : "Select a conversation"}
          </div>

          {/* Route error banner */}
          {routeError ? (
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #000",
                backgroundColor: "#3a2b2b",
                color: "#ffb3b3",
              }}
            >
              {routeError}
            </div>
          ) : null}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {messages.map((msg) => {
              const isMine = msg.sender === sender;

              return (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ maxWidth: "60%" }}>
                    <div
                      style={{
                        backgroundColor: isMine ? "#4A90E2" : "#444",
                        padding: "10px 15px",
                        borderRadius: "20px",
                        color: "white",
                        opacity: msg.isDeleted ? 0.7 : 1,
                      }}
                    >
                      {msg.isDeleted ? (
                        <span style={{ fontStyle: "italic" }}>
                          Message deleted
                        </span>
                      ) : editingId === msg.id ? (
                        <div>
                          <input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: "10px",
                              border: "none",
                              outline: "none",
                            }}
                          />
                          <div
                            style={{
                              marginTop: "8px",
                              display: "flex",
                              gap: "8px",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button onClick={() => editMessage(msg)}>
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId("");
                                setEditingText("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {msg.content}
                          {msg.editedAt ? (
                            <span
                              style={{ marginLeft: "8px", fontSize: "0.8rem" }}
                            >
                              (edited)
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {isMine && !msg.isDeleted && editingId !== msg.id ? (
                      <div
                        style={{
                          marginTop: "6px",
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditingText(msg.content || "");
                          }}
                          style={{ fontSize: "0.8rem" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMessage(msg)}
                          style={{ fontSize: "0.8rem" }}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid black",
              display: "flex",
              backgroundColor: "#1f1f1f",
              opacity: activeReceiver && !routeError ? 1 : 0.5,
            }}
          >
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                activeReceiver && !routeError
                  ? "Type a message..."
                  : "Select a valid conversation..."
              }
              disabled={!activeReceiver || !!routeError}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "20px",
                border: "none",
                outline: "none",
                backgroundColor: "#2d2d2d",
                color: "white",
                marginRight: "10px",
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!activeReceiver || !!routeError}
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#4A90E2",
                color: "white",
                cursor:
                  activeReceiver && !routeError ? "pointer" : "not-allowed",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagePage;