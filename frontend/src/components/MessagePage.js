import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import logo from '../images/search.png';

function MessagePage() {
    return (
        <div className='page-container'>
            <NavBar/>
            <div className='main-content' style={{ display: 'flex', padding: 0 }}>
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

                    <div style={{
                        padding: '20px'
                    }}>
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
                        
                        {/* Message list will go here */}

                    </div>
                </div>

                {/* Right Side - Main Chat Area */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#2d2d2d',
                    height: '100vh'
                }}>
                    {/* Empty header space to align with left side */}
                    <div style={{ 
                        borderBottom: "1px solid #000000ff", 
                        paddingBottom: "10px",
                        paddingTop: "50px",
                        height: '5px' 
                    }}>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default MessagePage;