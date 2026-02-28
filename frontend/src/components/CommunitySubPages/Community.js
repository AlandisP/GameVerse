import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "../NavBar";
import background from "../images/tempbackground.png"
import "./ComStyles.css";

function Community({Name, Description, MemberCount, CreatorId}) {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('communities');


    return (
        <div className='fcommunity'>
            <div className='imgbox'>
                <img src={background} alt='tempimg'></img>
            </div>
            <div className='topbox-txt'>
                <h3>Community Name</h3>
                <p className='count'>100</p>
            </div>
            <p className='description'>I don't know why I came in this club with you, girl (with you) Don't know why I came in with these diamonds on my chain (shine) Surrounded by bad bitches, I can't get 'em out my face Is it 'cause a nigga handsome and wealthy? </p>
            <button className='joinbtn'>Join</button>
        </div>

    );

}

export default Community;