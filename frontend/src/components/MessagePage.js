import React, { useEffect, useMemo, useRef, useState } from "react";
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
  updateDoc,
  writeBatch,
  getDocs,
  limit,
  where,
  setDoc,
} from "firebase/firestore";

function getOtherUser(participants, me) {
  return participants?.find((p) => p !== me) || "";
}

function getConversationPreviewText(convo) {
  return convo.lastMessageText || convo.lastMessage || "";
}

function getConversationLastMessageId(convo) {
  return convo?.lastMessageId || "";
}

async function validateUsernameExists(username) {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/users/exists/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return Boolean(res.data?.exists);
}

async function createOrGetConversation(currentUsername, targetUsername) {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/api/conversations/direct`,
    {
      currentUsername,
      targetUsername,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

async function ensureConversationDoc(convoId, sender, receiver) {
  if (!convoId || !sender || !receiver) return;

  const convoRef = doc(db, "conversations", convoId);

  await setDoc(
    convoRef,
    {
      participants: [sender, receiver],
      updatedAt: serverTimestamp(),
      lastMessageText: "",
      lastMessageAt: null,
      lastMessageSender: "",
      lastMessageId: "",
      lastMessage: "",
      lastSender: "",
    },
    { merge: true }
  );
}

function MessagePage() {
  const { receiverUsername } = useParams();
  const navigate = useNavigate();

  const sender = localStorage.getItem("username");

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [activeConversationId, setActiveConversationId] = useState("");
  const [activeReceiver, setActiveReceiver] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");

  const [isComposing, setIsComposing] = useState(false);
  const [newDmUsername, setNewDmUsername] = useState("");
  const [composeError, setComposeError] = useState("");

  const messagesUnsubRef = useRef(null);
  const inboxUnsubRef = useRef(null);
  const openingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function openFromUrl() {
      if (!sender || !receiverUsername) return;
      if (openingRef.current) return;

      if (receiverUsername.toLowerCase() === sender.toLowerCase()) {
        setActiveConversationId("");
        setActiveReceiver("");
        setMessages([]);
        return;
      }

      try {
        openingRef.current = true;

        const exists = await validateUsernameExists(receiverUsername);
        if (cancelled) return;

        if (!exists) {
          setComposeError(`User "${receiverUsername}" does not exist.`);
          setActiveConversationId("");
          setActiveReceiver("");
          setMessages([]);
          return;
        }

        const convo = await createOrGetConversation(sender, receiverUsername);
        if (cancelled) return;

        const convoId = convo.id;
        await ensureConversationDoc(convoId, sender, receiverUsername);
        if (cancelled) return;

        setActiveConversationId(convoId);
        setActiveReceiver(receiverUsername);
        setComposeError("");
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setComposeError("Could not open conversation.");
        setActiveConversationId("");
        setActiveReceiver("");
        setMessages([]);
      } finally {
        openingRef.current = false;
      }
    }

    openFromUrl();

    return () => {
      cancelled = true;
    };
  }, [sender, receiverUsername]);

  useEffect(() => {
    if (!sender || typeof sender !== "string" || !sender.trim()) return;

    if (inboxUnsubRef.current) {
      inboxUnsubRef.current();
      inboxUnsubRef.current = null;
    }

    const inboxQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", sender),
      orderBy("updatedAt", "desc")
    );

    inboxUnsubRef.current = onSnapshot(
      inboxQuery,
      (snapshot) => {
        const map = new Map();

        snapshot.docs.forEach((d) => {
          const data = d.data();
          const other = getOtherUser(data.participants, sender);
          if (!other) return;

          const existing = map.get(other);

          if (!existing) {
            map.set(other, { id: d.id, ...data });
            return;
          }

          const existingTime = existing.updatedAt?.seconds || 0;
          const currentTime = data.updatedAt?.seconds || 0;

          if (currentTime >= existingTime) {
            map.set(other, { id: d.id, ...data });
          }
        });

        setConversations(Array.from(map.values()));
      },
      (err) => console.error("onSnapshot inbox error:", err)
    );

    return () => {
      if (inboxUnsubRef.current) {
        inboxUnsubRef.current();
        inboxUnsubRef.current = null;
      }
    };
  }, [sender]);

  const filteredConversations = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return conversations;

    return conversations.filter((c) => {
      const other = getOtherUser(c.participants, sender).toLowerCase();
      return other.includes(s);
    });
  }, [conversations, search, sender]);

  useEffect(() => {
    if (messagesUnsubRef.current) {
      messagesUnsubRef.current();
      messagesUnsubRef.current = null;
    }

    if (
      !activeConversationId ||
      typeof activeConversationId !== "string" ||
      !activeConversationId.trim()
    ) {
      setMessages([]);
      return;
    }

    const convId = activeConversationId.trim();

    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("timestamp", "asc")
    );

    messagesUnsubRef.current = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(list);
      },
      (err) => {
        console.error("onSnapshot messages error:", err);
        setMessages([]);
      }
    );

    return () => {
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
    };
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
      lastMessage: next.content || "",
      lastSender: next.sender || "",
    });
  }

  async function sendMessage() {
    const text = messageInput.trim();
    if (!text || !sender || !activeReceiver) return;

    try {
      const exists = await validateUsernameExists(activeReceiver);
      if (!exists) {
        setComposeError(`User "${activeReceiver}" does not exist.`);
        return;
      }
    } catch (e) {
      console.error(e);
      setComposeError("Could not validate user.");
      return;
    }

    let convoId = activeConversationId;

    try {
      if (!convoId) {
        const convo = await createOrGetConversation(sender, activeReceiver);
        convoId = convo.id;
        setActiveConversationId(convoId);
      }

      await ensureConversationDoc(convoId, sender, activeReceiver);

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
      setComposeError("");
    } catch (e) {
      console.error(e);
      setComposeError("Could not send message.");
    }
  }

  async function editMessage(msg) {
    const text = editingText.trim();
    if (!text || !activeConversationId) return;

    try {
      const msgRef = doc(
        db,
        "conversations",
        activeConversationId,
        "messages",
        msg.id
      );

      await updateDoc(msgRef, { content: text, editedAt: serverTimestamp() });

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
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteMessage(msg) {
    if (!activeConversationId) return;

    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  async function startNewConversation() {
    const target = newDmUsername.trim();

    if (!sender) return;
    if (!target) {
      setComposeError("Enter a username.");
      return;
    }
    if (target.toLowerCase() === sender.toLowerCase()) {
      setComposeError("You can't message yourself.");
      return;
    }

    try {
      const exists = await validateUsernameExists(target);
      if (!exists) {
        setComposeError(`User "${target}" does not exist.`);
        return;
      }

      setComposeError("");

      const convo = await createOrGetConversation(sender, target);
      const convoId = convo.id;

      await ensureConversationDoc(convoId, sender, target);

      setActiveConversationId(convoId);
      setActiveReceiver(target);

      navigate(`/messages/${target}`);

      setIsComposing(false);
      setNewDmUsername("");
      setEditingId("");
      setEditingText("");
    } catch (e) {
      console.error(e);
      setComposeError("Could not start conversation.");
    }
  }

  async function openConversation(convo) {
    const other = getOtherUser(convo.participants, sender);
    if (!other) return;

    try {
      await ensureConversationDoc(convo.id, sender, other);

      setActiveConversationId(convo.id);
      setActiveReceiver(other);

      setComposeError("");
      setEditingId("");
      setEditingText("");

      navigate(`/messages/${other}`);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="page-container">
      <NavBar />
      <div className="main-content" style={{ display: "flex", padding: 0 }}>
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
            {activeReceiver ? `@${activeReceiver}` : "Select a conversation"}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              backgroundColor: "#2d2d2d",
            }}
          >
            {messages.map((msg) => {
              const isMine = msg.sender === sender;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "60%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMine ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.isDeleted ? (
                      <div
                        style={{
                          backgroundColor: "#444",
                          color: "white",
                          padding: "10px 14px",
                          borderRadius: "18px",
                          fontStyle: "italic",
                          opacity: 0.8,
                          display: "inline-block",
                          maxWidth: "100%",
                          wordBreak: "break-word",
                        }}
                      >
                        Message deleted
                      </div>
                    ) : editingId === msg.id ? (
                      <div
                        style={{
                          backgroundColor: isMine ? "#4A90E2" : "#444",
                          padding: "10px 14px",
                          borderRadius: "18px",
                          display: "inline-block",
                          maxWidth: "100%",
                          minWidth: "220px",
                        }}
                      >
                        <input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "10px",
                            border: "none",
                            outline: "none",
                            boxSizing: "border-box",
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
                          <button
                            onClick={() => editMessage(msg)}
                            style={{
                              backgroundColor: "white",
                              color: "#111",
                              border: "none",
                              borderRadius: "999px",
                              padding: "6px 12px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId("");
                              setEditingText("");
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "white",
                              border: "1px solid rgba(255,255,255,0.6)",
                              borderRadius: "999px",
                              padding: "6px 12px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          backgroundColor: isMine ? "#4A90E2" : "#444",
                          color: "white",
                          padding: "10px 14px",
                          borderRadius: "18px",
                          display: "inline-block",
                          maxWidth: "100%",
                          wordBreak: "break-word",
                          width: "fit-content",
                        }}
                      >
                        {msg.content}
                        {msg.editedAt ? (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "12px",
                              opacity: 0.75,
                            }}
                          >
                            edited
                          </span>
                        ) : null}
                      </div>
                    )}

                    {isMine && !msg.isDeleted && editingId !== msg.id ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "6px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditingText(msg.content || "");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#bdbdbd",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMessage(msg)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#bdbdbd",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: 0,
                          }}
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

          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid #000",
              display: "flex",
              backgroundColor: "#2d2d2d",
              opacity: activeReceiver ? 1 : 0.5,
              gap: "10px",
            }}
          >
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                activeReceiver ? "Type a message..." : "Select a conversation..."
              }
              disabled={!activeReceiver}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "999px",
                border: "none",
                outline: "none",
                backgroundColor: "#1f1f1f",
                color: "white",
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!activeReceiver}
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#4A90E2",
                color: "white",
                cursor: activeReceiver ? "pointer" : "not-allowed",
                fontWeight: 700,
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