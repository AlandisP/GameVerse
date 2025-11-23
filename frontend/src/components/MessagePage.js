import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import logo from '../images/search.png';
function MessagePage() {
    return (
        <div className='page-container'>
            <NavBar/>
            <div className='main-content'>
                <div className='mainPortion'>
                    <h1 className='Message-Title'>Messages</h1>
                    <div className='search'>
                        <div className='search-bar'>
                            <img src={logo} alt='' />
                            <input type='text' placeholder='Search'/>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
        
}

export default MessagePage;
