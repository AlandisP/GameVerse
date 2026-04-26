import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import logo from "../images/search.png";

import API_URL from "../config/api";

import { db } from "../firebase";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
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

function getConversationDisplayName(convo, me) {
  if (!convo) return "";
  if (convo.type === "GROUP") return convo.title || "Untitled Group";
  return getOtherUser(convo.participants, me);
}

function getConversationHeaderText(convo, me) {
  if (!convo) return "No conversation selected";

  if (convo.type === "GROUP") {
    return `Group: ${convo.title || "Untitled Group"}`;
  }

  const otherUser = getOtherUser(convo.participants, me);
  return otherUser ? `Chatting with: ${otherUser}` : "Direct message";
}

function getGroupMembers(convo) {
  if (!convo?.participants) return [];
  return convo.participants.filter(Boolean);
}

function formatMemberLabel(member, me) {
  return member === me ? `${member} (you)` : member;
}

function shouldShowSenderName(activeConversation, msg, currentUser) {
  return (
    activeConversation?.type === "GROUP" &&
    msg.sender &&
    msg.sender !== currentUser &&
    !msg.isDeleted
  );
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

async function createGroupConversation(currentUsername, title, usernames) {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/api/conversations/groups`,
    {
      currentUsername,
      title,
      usernames,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

async function fetchBackendConversations(currentUsername) {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/api/conversations/mine`, {
    params: { currentUsername },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

async function ensureConversationDoc({
  convoId,
  participants = [],
  type = "DIRECT",
  title = "",
}) {
  if (!convoId || !participants.length) return;

  const convoRef = doc(db, "conversations", convoId);

  const snap = await getDocs(
    query(collection(db, "conversations"), where("__name__", "==", convoId))
  );

  if (!snap.empty) return;

  const unreadCounts = {};
  participants.forEach((user) => {
    unreadCounts[user] = 0;
  });

  await setDoc(
    convoRef,
    {
      participants,
      type,
      title: type === "GROUP" ? title : "",
      unreadCounts,
      adminIds: type === "GROUP" ? [participants[0]] : [],
      hiddenFor: [],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function MessagePage() {
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

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMembersInput, setGroupMembersInput] = useState("");
  const [groupError, setGroupError] = useState("");

  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState("");
  const [addMemberError, setAddMemberError] = useState("");

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const isAdmin = activeConversation?.adminIds?.includes(sender);

  useEffect(() => {
    setShowMembers(false);
    setShowAddMember(false);
    setAddMemberInput("");
    setAddMemberError("");
  }, [activeConversationId]);

  useEffect(() => {
    async function syncBackendConversationsToFirestore() {
      if (!sender || typeof sender !== "string" || !sender.trim()) return;

      try {
        const backendConversations = await fetchBackendConversations(sender);

        for (const convo of backendConversations) {
          await ensureConversationDoc({
            convoId: convo.id,
            participants: convo.participants || [],
            type: convo.type || "DIRECT",
            title: convo.title || "",
          });
        }
      } catch (err) {
        console.error("Failed to sync backend conversations:", err);
      }
    }

    syncBackendConversationsToFirestore();
  }, [sender]);

  useEffect(() => {
    if (!sender || typeof sender !== "string" || !sender.trim()) {
      setConversations([]);
      return undefined;
    }

    const inboxQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", sender),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      inboxQuery,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter((c) => !c.hiddenFor?.includes(sender));

        setConversations(list);
      },
      (err) => {
        console.error("onSnapshot inbox error:", err);
        setConversations([]);
      }
    );

    return () => unsubscribe();
  }, [sender]);

  const filteredConversations = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return conversations;

    return conversations.filter((c) => {
      const displayName = getConversationDisplayName(c, sender).toLowerCase();
      return displayName.includes(s);
    });
  }, [conversations, search, sender]);

  useEffect(() => {
    if (
      !activeConversationId ||
      typeof activeConversationId !== "string" ||
      !activeConversationId.trim()
    ) {
      setMessages([]);
      return undefined;
    }

    const convId = activeConversationId.trim();

    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
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

    if (!text || !sender || !activeConversationId) return;

    const isGroup = activeConversation?.type === "GROUP";

    if (!isGroup) {
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
    }

    let convoId = activeConversationId;

    try {
      if (!convoId && !isGroup && activeReceiver) {
        const convo = await createOrGetConversation(sender, activeReceiver);
        convoId = convo.id;
        setActiveConversationId(convoId);
      }

      const participants =
        activeConversation?.participants ||
        (activeReceiver ? [sender, activeReceiver] : [sender]);

      await ensureConversationDoc({
        convoId,
        participants,
        type: activeConversation?.type || "DIRECT",
        title: activeConversation?.title || "",
      });

      const convoRef = doc(db, "conversations", convoId);
      const msgRef = doc(collection(db, "conversations", convoId, "messages"));

      const unreadUpdates = {};

      participants.forEach((user) => {
        unreadUpdates[`unreadCounts.${user}`] =
          user === sender ? 0 : increment(1);
      });

      const batch = writeBatch(db);

      batch.set(
        convoRef,
        {
          participants,
          memberIds: participants,
          type: activeConversation?.type || "DIRECT",
          title:
            activeConversation?.type === "GROUP"
              ? activeConversation?.title || ""
              : "",
          updatedAt: serverTimestamp(),
          lastMessageText: text,
          lastMessageAt: serverTimestamp(),
          lastMessageSender: sender,
          lastMessageId: msgRef.id,
          lastMessage: text,
          lastSender: sender,
          ...unreadUpdates,
        },
        { merge: true }
      );

      batch.set(msgRef, {
        sender,
        receiver: isGroup ? null : activeReceiver,
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

  async function deleteDMForMe(convoId) {
    if (!convoId || !sender) return;

    try {
      await updateDoc(doc(db, "conversations", convoId), {
        hiddenFor: arrayUnion(sender),
      });

      setActiveConversationId("");
      setActiveReceiver("");
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  }

  async function leaveGroupChat(convoId) {
    if (!convoId || !sender) return;

    try {
      const convoRef = doc(db, "conversations", convoId);
      const msgRef = doc(collection(db, "conversations", convoId, "messages"));

      await setDoc(msgRef, {
        sender: "system",
        content: `${sender} left the group.`,
        timestamp: serverTimestamp(),
        editedAt: null,
        isDeleted: false,
        isSystem: true,
      });

      await updateDoc(convoRef, {
        participants: arrayRemove(sender),
        hiddenFor: arrayUnion(sender),
        lastMessageText: `${sender} left the group.`,
        lastMessage: `${sender} left the group.`,
        lastMessageSender: "system",
        lastMessageId: msgRef.id,
        updatedAt: serverTimestamp(),
      });

      setActiveConversationId("");
      setActiveReceiver("");
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteGroupChatForEveryone(convoId) {
    if (!convoId) return;

    try {
      const messagesRef = collection(db, "conversations", convoId, "messages");
      const snap = await getDocs(messagesRef);

      for (const m of snap.docs) {
        await deleteDoc(m.ref);
      }

      await deleteDoc(doc(db, "conversations", convoId));

      setActiveConversationId("");
      setActiveReceiver("");
      setMessages([]);
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

      await ensureConversationDoc({
        convoId,
        participants: [sender, target],
        type: "DIRECT",
        title: "",
      });

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === convoId);
        if (exists) return prev;

        return [
          {
            id: convoId,
            participants: [sender, target],
            type: "DIRECT",
            title: "",
            lastMessageText: "",
            updatedAt: null,
            unreadCounts: {},
          },
          ...prev,
        ];
      });

      setActiveConversationId(convoId);
      setActiveReceiver(target);

      setIsComposing(false);
      setNewDmUsername("");
      setEditingId("");
      setEditingText("");
    } catch (e) {
      console.error(e);
      setComposeError("Could not start conversation.");
    }
  }

  async function startNewGroupConversation() {
    if (!sender) return;

    const title = groupTitle.trim();
    const rawMembers = groupMembersInput
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const uniqueMembers = [...new Set(rawMembers)].filter(
      (name) => name.toLowerCase() !== sender.toLowerCase()
    );

    if (!title) {
      setGroupError("Enter a group title.");
      return;
    }

    if (uniqueMembers.length < 2) {
      setGroupError("Enter at least 2 other usernames.");
      return;
    }

    try {
      setGroupError("");

      const convo = await createGroupConversation(sender, title, uniqueMembers);
      const convoId = convo.id;

      const newConversation = {
        id: convoId,
        participants: [sender, ...uniqueMembers],
        type: "GROUP",
        title,
        adminIds: [sender],
        hiddenFor: [],
        lastMessageText: "",
        lastMessageAt: null,
        lastMessageSender: "",
        lastMessageId: "",
        lastMessage: "",
        lastSender: "",
        updatedAt: null,
      };

      await ensureConversationDoc({
        convoId,
        participants: newConversation.participants,
        type: "GROUP",
        title,
      });

      setConversations((prev) => {
        const alreadyExists = prev.some((c) => c.id === convoId);
        if (alreadyExists) return prev;
        return [newConversation, ...prev];
      });

      setActiveConversationId(convoId);
      setActiveReceiver("");
      setIsCreatingGroup(false);
      setGroupTitle("");
      setGroupMembersInput("");
      setEditingId("");
      setEditingText("");
    } catch (e) {
      console.error(e);
      setGroupError(
        e?.response?.data?.error || "Could not create group conversation."
      );
    }
  }

  async function addMemberToActiveGroup() {
    const usernameToAdd = addMemberInput.trim();

    if (!activeConversationId || activeConversation?.type !== "GROUP") return;

    if (!isAdmin) {
      setAddMemberError("Only admins can add members.");
      return;
    }

    if (!usernameToAdd) {
      setAddMemberError("Enter a username.");
      return;
    }

    if (activeConversation.participants?.includes(usernameToAdd)) {
      setAddMemberError(`${usernameToAdd} is already in this group.`);
      return;
    }

    try {
      const exists = await validateUsernameExists(usernameToAdd);

      if (!exists) {
        setAddMemberError(`User "${usernameToAdd}" does not exist.`);
        return;
      }

      const convoRef = doc(db, "conversations", activeConversationId);
      const msgRef = doc(
        collection(db, "conversations", activeConversationId, "messages")
      );

      const systemText = `${sender} added ${usernameToAdd} to the group.`;

      const batch = writeBatch(db);

      batch.update(convoRef, {
        participants: arrayUnion(usernameToAdd),
        memberIds: arrayUnion(usernameToAdd),
        hiddenFor: arrayRemove(usernameToAdd),
        [`unreadCounts.${usernameToAdd}`]: 0,
        lastMessageText: systemText,
        lastMessage: systemText,
        lastMessageSender: "system",
        lastMessageId: msgRef.id,
        updatedAt: serverTimestamp(),
      });

      batch.set(msgRef, {
        sender: "system",
        content: systemText,
        timestamp: serverTimestamp(),
        editedAt: null,
        isDeleted: false,
        isSystem: true,
      });

      await batch.commit();

      setAddMemberInput("");
      setAddMemberError("");
      setShowAddMember(false);
    } catch (e) {
      console.error(e);
      setAddMemberError("Could not add member.");
    }
  }

  async function openConversation(convo) {
    const isGroup = convo.type === "GROUP";

    try {
      if (convo.id === activeConversationId) return;

      await ensureConversationDoc({
        convoId: convo.id,
        participants: convo.participants || [],
        type: convo.type || "DIRECT",
        title: convo.title || "",
      });

      setActiveConversationId(convo.id);
      setComposeError("");
      setEditingId("");
      setEditingText("");

      await updateDoc(doc(db, "conversations", convo.id), {
        [`unreadCounts.${sender}`]: 0,
      });

      if (isGroup) {
        setActiveReceiver("");
        return;
      }

      const other = getOtherUser(convo.participants, sender);
      setActiveReceiver(other || "");
    } catch (e) {
      console.error(e);
    }
  }

  const totalUnreadMessages = conversations.reduce((total, convo) => {
    return total + (convo.unreadCounts?.[sender] || 0);
  }, 0);

  return (
    <div className="page-container">
      <NavBar unreadMessageCount={totalUnreadMessages} />

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

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                onClick={() => {
                  setIsComposing((v) => !v);
                  setIsCreatingGroup(false);
                  setComposeError("");
                  setNewDmUsername("");
                }}
                style={{
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

              <button
                onClick={() => {
                  setIsCreatingGroup((v) => !v);
                  setIsComposing(false);
                  setGroupError("");
                  setGroupTitle("");
                  setGroupMembersInput("");
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#4A90E2",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                New group
              </button>
            </div>
          </div>

          {isComposing && (
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

                {composeError && (
                  <div
                    style={{
                      color: "#ffb3b3",
                      marginTop: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {composeError}
                  </div>
                )}

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
          )}

          {isCreatingGroup && (
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
                  Create a Group Chat
                </div>

                <input
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="Group title"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    outline: "none",
                    backgroundColor: "#1f1f1f",
                    color: "white",
                    marginBottom: "10px",
                  }}
                />

                <input
                  value={groupMembersInput}
                  onChange={(e) => setGroupMembersInput(e.target.value)}
                  placeholder="Enter usernames, comma separated"
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
                    if (e.key === "Enter") startNewGroupConversation();
                  }}
                />

                {groupError && (
                  <div
                    style={{
                      color: "#ffb3b3",
                      marginTop: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {groupError}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={startNewGroupConversation}
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
                    Create
                  </button>

                  <button
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setGroupError("");
                      setGroupTitle("");
                      setGroupMembersInput("");
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
          )}

          <div style={{ padding: "20px" }}>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "14px",
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
                border: "2px solid #cfcfcf",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            >
              <img
                src={logo}
                alt="search"
                style={{ width: "20px", marginRight: "10px" }}
              />

              <input
                type="text"
                placeholder="Search conversations"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#111",
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          <div style={{ overflowY: "auto", padding: "0 10px 20px 10px" }}>
            {filteredConversations.length === 0 ? (
              <div
                style={{
                  color: "#bdbdbd",
                  padding: "0 16px",
                  fontSize: "0.95rem",
                }}
              >
                No conversations yet.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const displayName = getConversationDisplayName(c, sender);
                const isActive = c.id === activeConversationId;
                const preview = getConversationPreviewText(c);
                const unreadCount = c.unreadCounts?.[sender] || 0;

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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{displayName}</span>

                      {unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "#058BFE",
                            color: "white",
                            borderRadius: "999px",
                            padding: "2px 7px",
                            fontSize: "12px",
                            fontWeight: 700,
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>

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
              })
            )}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {getConversationHeaderText(activeConversation, sender)}
              </div>

              {!activeConversation && (
                <div
                  style={{
                    color: "#bdbdbd",
                    fontSize: "0.9rem",
                    marginTop: "4px",
                  }}
                >
                  Choose a chat from the left to start messaging.
                </div>
              )}
            </div>

            {activeConversation?.type === "DIRECT" && (
              <button
                onClick={() => deleteDMForMe(activeConversation.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Delete Chat
              </button>
            )}

            {activeConversation?.type === "GROUP" && (
              <div style={{ position: "relative", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setShowMembers((v) => !v);
                    setShowAddMember(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #444",
                    backgroundColor: "#3a3a3a",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Members ({getGroupMembers(activeConversation).length})
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowAddMember((v) => !v);
                      setShowMembers(false);
                      setAddMemberError("");
                      setAddMemberInput("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #444",
                      backgroundColor: "#058BFE",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Add Member
                  </button>
                )}

                {!isAdmin && (
                  <button
                    onClick={() => leaveGroupChat(activeConversation.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#ff4d4f",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Leave Group
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() =>
                      deleteGroupChatForEveryone(activeConversation.id)
                    }
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#ff0000",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Delete Group
                  </button>
                )}

                {showMembers && (
                  <div
                    style={{
                      position: "absolute",
                      top: "42px",
                      right: 0,
                      minWidth: "220px",
                      backgroundColor: "#2f2f2f",
                      border: "1px solid #444",
                      borderRadius: "12px",
                      padding: "10px",
                      zIndex: 20,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                      Group Members
                    </div>

                    {getGroupMembers(activeConversation).map((member) => (
                      <div
                        key={member}
                        style={{
                          color: "#d9d9d9",
                          padding: "6px 0",
                          borderBottom: "1px solid #3d3d3d",
                        }}
                      >
                        {formatMemberLabel(member, sender)}
                      </div>
                    ))}
                  </div>
                )}

                {showAddMember && (
                  <div
                    style={{
                      position: "absolute",
                      top: "42px",
                      right: "150px",
                      minWidth: "260px",
                      backgroundColor: "#2f2f2f",
                      border: "1px solid #444",
                      borderRadius: "12px",
                      padding: "10px",
                      zIndex: 25,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                      Add Member
                    </div>

                    <input
                      value={addMemberInput}
                      onChange={(e) => setAddMemberInput(e.target.value)}
                      placeholder="Enter username"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addMemberToActiveGroup();
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: "#1f1f1f",
                        color: "white",
                      }}
                    />

                    {addMemberError && (
                      <div style={{ color: "#ffb3b3", marginTop: "8px" }}>
                        {addMemberError}
                      </div>
                    )}

                    <button
                      onClick={addMemberToActiveGroup}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: "#4A90E2",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              backgroundColor: "#2d2d2d",
            }}
          >
            {messages.length === 0 && activeConversation && (
              <div
                style={{
                  color: "#bdbdbd",
                  textAlign: "center",
                  marginTop: "40px",
                  fontSize: "0.95rem",
                }}
              >
                {activeConversation.type === "DIRECT"
                  ? `Start your conversation with ${getOtherUser(
                      activeConversation.participants,
                      sender
                    )}`
                  : "No messages yet. Start the conversation."}
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.sender === sender;
              const showSenderName = shouldShowSenderName(
                activeConversation,
                msg,
                sender
              );

              if (msg.isSystem) {
                return (
                  <div
                    key={msg.id}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#3a3a3a",
                        color: "#d9d9d9",
                        padding: "8px 14px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontStyle: "italic",
                        maxWidth: "70%",
                        textAlign: "center",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  style={{
                    width: "fit-content",
                    maxWidth: "60%",
                    marginLeft: isMine ? "auto" : 0,
                    marginRight: isMine ? 0 : "auto",
                    marginBottom: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                    background: "transparent",
                  }}
                >
                  {showSenderName && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#bdbdbd",
                        marginBottom: "4px",
                        paddingLeft: "4px",
                        fontWeight: 700,
                      }}
                    >
                      {msg.sender}
                    </div>
                  )}

                  {msg.isDeleted ? (
                    <div
                      style={{
                        backgroundColor: "#444",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: "18px",
                        fontStyle: "italic",
                        opacity: 0.8,
                        width: "fit-content",
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
                        width: "fit-content",
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
                        width: "fit-content",
                        maxWidth: "100%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}

                      {msg.editedAt && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "12px",
                            opacity: 0.75,
                          }}
                        >
                          edited
                        </span>
                      )}
                    </div>
                  )}

                  {isMine && !msg.isDeleted && editingId !== msg.id && (
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
                  )}
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
              opacity: activeConversationId ? 1 : 0.5,
              gap: "10px",
            }}
          >
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                activeConversationId
                  ? "Type a message..."
                  : "Choose a chat to start messaging..."
              }
              disabled={!activeConversationId}
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
              disabled={!activeConversationId}
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#4A90E2",
                color: "white",
                cursor: activeConversationId ? "pointer" : "not-allowed",
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