import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import logo from '../images/search.png';

// Firebase imports
import { db } from "../firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    onSnapshot,
    orderBy
} from "firebase/firestore";

function MessagePage() {


    // MESSAGE STATE

    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);

    const sender = localStorage.getItem("username");
    const receiver = "testUser"; // TEMP — will replace later

    // SEND MESSAGE
    async function sendMessage() {
        if (!messageInput.trim()) return;

        await addDoc(collection(db, "messages"), {
            sender,
            receiver,
            content: messageInput,
            timestamp: serverTimestamp(),
        });

        setMessageInput("");
    }

    // REAL-TIME MESSAGE LISTENER
    useEffect(() => {
    const q = query(
        collection(db, "messages"),
        orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(list); // show all messages
    });

    return () => unsubscribe();
}, [sender, receiver]);


    return (
        <div className='page-container'>
            <NavBar/>
            <div className='main-content' style={{ display: 'flex', padding: 0 }}>
                
                {/* LEFT SIDEBAR */}
                <div style={{
                    width: '350px',
                    backgroundColor: '#373737',
                    height: '100vh',
                    borderRight: "1px solid #000000ff",
                }}>
                    <div style={{ 
                        borderBottom: "1px solid #000000ff", 
                        paddingBottom: "10px",
                        paddingTop: "50px",
                        paddingLeft: "40px"
                    }}>
                        <h1 style={{ 
                            color: "white", 
                            fontSize: "32px",
                            margin: "0"
                        }}>
                            Messages 
                        </h1>
                    </div>

                    <div style={{ padding: '20px' }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '25px',
                            padding: '10px 15px',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px'
                        }}>
                            <img src={logo} alt="search" style={{ width: '20px', marginRight: '10px' }} />
                            <input 
                                type="text" 
                                placeholder="Search"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    width: '100%'
                                }}
                            />
                        </div>
                        
                        {/* FUTURE: Conversation list */}
                    </div>
                </div>

                {/* RIGHT CHAT AREA */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#2d2d2d',
                    height: '100vh',
                    display: "flex",
                    flexDirection: "column"
                }}>
                    
                    {/* Spacer matching left top */}
                    <div style={{ 
                        borderBottom: "1px solid #000000ff", 
                        paddingBottom: "10px",
                        paddingTop: "50px",
                        height: '5px' 
                    }} />

                    {/* MESSAGE BUBBLES */}
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "20px"
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                marginBottom: "10px",
                                display: "flex",
                                justifyContent: msg.sender === sender ? "flex-end" : "flex-start"
                            }}>
                                <div style={{
                                    backgroundColor: msg.sender === sender ? "#4A90E2" : "#444",
                                    padding: "10px 15px",
                                    borderRadius: "20px",
                                    maxWidth: "60%",
                                    color: "white"
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MESSAGE INPUT */}
                    <div style={{
                        padding: "15px",
                        borderTop: "1px solid black",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#1f1f1f"
                    }}>
                        <input
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "20px",
                                border: "none",
                                outline: "none",
                                backgroundColor: "#2d2d2d",
                                color: "white",
                                marginRight: "10px"
                            }}
                        />

                        <button
                            onClick={sendMessage}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "20px",
                                border: "none",
                                backgroundColor: "#4A90E2",
                                color: "white",
                                cursor: "pointer"
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
