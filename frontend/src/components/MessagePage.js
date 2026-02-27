import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import logo from "../images/search.png";

import { db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

function getConversationId(user1, user2) {
  return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
}

function getOtherUser(participants, me) {
  return participants?.find((p) => p !== me) || "";
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

  // If URL has a receiver, open that conversation
  useEffect(() => {
    if (!sender || !receiverUsername) return;

    const convoId = getConversationId(sender, receiverUsername);
    setActiveConversationId(convoId);
    setActiveReceiver(receiverUsername);

    // Ensure conversation doc exists so it shows in inbox immediately
    setDoc(
      doc(db, "conversations", convoId),
      {
        participants: [sender, receiverUsername],
        updatedAt: serverTimestamp(),
        lastMessage: "",
        lastSender: "",
      },
      { merge: true }
    );
  }, [sender, receiverUsername]);

  // Load inbox conversation list (persists across refresh/login)
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

  async function sendMessage() {
    if (!messageInput.trim() || !sender || !activeReceiver) return;

    const convoId =
      activeConversationId || getConversationId(sender, activeReceiver);

    await setDoc(
      doc(db, "conversations", convoId),
      {
        participants: [sender, activeReceiver],
        updatedAt: serverTimestamp(),
        lastMessage: messageInput,
        lastSender: sender,
      },
      { merge: true }
    );

    await addDoc(collection(db, "conversations", convoId, "messages"), {
      sender,
      receiver: activeReceiver,
      content: messageInput,
      timestamp: serverTimestamp(),
    });

    setMessageInput("");
  }

  function openConversation(convo) {
    const other = getOtherUser(convo.participants, sender);
    navigate(`/messages/${other}`); // ✅ Proper router navigation
    setActiveConversationId(convo.id);
    setActiveReceiver(other);
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
          </div>

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
                    {c.lastMessage || "No messages yet."}
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

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent:
                    msg.sender === sender ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === sender ? "#4A90E2" : "#444",
                    padding: "10px 15px",
                    borderRadius: "20px",
                    maxWidth: "60%",
                    color: "white",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid black",
              display: "flex",
              backgroundColor: "#1f1f1f",
              opacity: activeReceiver ? 1 : 0.5,
            }}
          >
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                activeReceiver ? "Type a message..." : "Select a conversation..."
              }
              disabled={!activeReceiver}
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
              disabled={!activeReceiver}
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#4A90E2",
                color: "white",
                cursor: activeReceiver ? "pointer" : "not-allowed",
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