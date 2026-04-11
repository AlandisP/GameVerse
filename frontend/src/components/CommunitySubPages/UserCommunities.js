import React, { useState, useEffect, useSyncExternalStore } from 'react';
import "./ExploreCommunities.css";
import backbtn from "../../images/u-turn-arrow.png"
import logo from "../../images/search.png"
import API_URL from '../../config/api';
import axios from 'axios';
import CommunityBlock from './CommunityBlock';
import { useNavigate } from 'react-router-dom';

function UserCommunities({isOpen, onClose, communities, Refresh}) {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');

    const ReadCommunities = () => {
        const items = communities.map((community, ind) => (
            <CommunityDisplay key={ind} Name={community.name} Members={community.memberCount} id={community.id} Refresh={Refresh} Banner={community.banner} PFP={community.pfp}/>
        ));
        return(
            <div className='mycomholder'>{items}</div>
        )
    }



    return(
        <>
            {isOpen?(
                <div className='exploreMain'>
                    <div className='header'>
                        <h2 className='headertxt2'>My Communities</h2>
                        <img src= {backbtn} className="backimg" onClick={onClose}/>
                    </div>
                    <p className='explainMyComs'>Connect with your fellow gamers across your communities.</p>
                    <ReadCommunities/>
                    
                </div>
            ):""}
        </>

    );
}

function CommunityDisplay({Name, Members, Refresh, PFP, Banner}) {
    const navigate  = useNavigate();
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');

    const handleLeaveClick = async(e) => {
        try {
            const res = await axios.put(
                `${API_URL}/communities/${Name}/leave`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            Refresh();
            
        } catch(error) {
            console.error("failed to leave community: ", error.response?.data || error.message);
        }
    }

    return(
        <div className='mycomblock'>
            <div className='emptybox'>
                {Banner!==null && <img src={Banner} alt='combanner'/>}
            </div>
            <div className='emptybox2'>
                {PFP!==null && <img src={PFP} alt='combanner'/>}
            </div>
            <h2 className='mytitle'>{Name}</h2>
            <p>{Members} Members</p>
            <div className='btnrow'>
                <button className='newbtn' onClick={() => navigate(`/communities/${Name}`)}>View</button>
                <button className='newbtn2' onClick={handleLeaveClick}>Leave</button>
            </div>
        </div>
    )

}

export default UserCommunities;