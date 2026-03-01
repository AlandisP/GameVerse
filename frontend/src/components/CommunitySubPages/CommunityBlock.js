import React, { useState, useEffect, useSyncExternalStore } from 'react';
import "./ExploreCommunities.css";
import backbtn from "../../images/u-turn-arrow.png"
import logo from "../../images/search.png"
import API_URL from '../../config/api';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
function CommunityBlock({Name, Description, Members, Category, id, OwnerId}) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const [memberCount, setMemberCount] = useState(Members);
    const [joined, setJoined] = useState(false);
    const [members, setMembers] = useState([]);
    const isOwner = userId===OwnerId;
    const isMember = members?.some(member => member.id === userId);

    const handleJoinClick = async(e) => {
        e.stopPropagation();
        try {
            const res = await axios.put(
                `${API_URL}/communities/${Name}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMemberCount(prev => prev + 1);
            setMembers(prev => [...prev, { id: userId, username: username }]);
            setJoined(true);
        } catch (error) {
            console.error("failed to join community: ", error.response?.data || error.message);
        }
    }

    const handleLeaveClick = async(e) => {
        e.stopPropagation();
        try {
            const res = await axios.put(
                `${API_URL}/communities/${Name}/leave`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            setMemberCount(prev => prev - 1);
            setMembers(prev => prev.filter(member => member.id !== userId));
            setJoined(false);
        } catch(error) {
            console.error("failed to leave community: ", error.response?.data || error.message);
        }
    }

   useEffect(() => {
        const GetMembers = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/communities/${Name}/AllMembers`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMembers(res.data);
                console.log(res.data);
                
            } catch (error) {
                console.error("Couldn't fetch the members")
            }
        }
        GetMembers();
        
    }, [token])


    return (
        <div className='communityBlock'>
            <div className='emptyBox'></div>
            <div className='text-container'>
                <p className='comName' onClick={() => navigate(`/communities/${Name}`)}>{Name}</p>
                <p className='memberCount'>{memberCount} Members</p>
                <p>{Description}</p>
                <p className='com-cat'>{Category}</p>
            </div>
            <div className='right'>
                {
                    !isMember?(
                        <button className='joinbtn' onClick={handleJoinClick}>Join</button>
                    ):<button className='leavebtn' onClick={ () => navigate(`/communities/${Name}`)}>View</button>
                }
            </div>
        </div>
    );

}

export default CommunityBlock;