import React, { useState, useEffect } from 'react';
import "../PF.css";
import "../Overlay.css";
import API_URL from '../../config/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pfp from '../../images/Profile.png'
const urlprefab = "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";
function MembersOverlay({isOpen, onClose, members, CreatorId, partyName, refresh, refreshCurrent}) {
    const token  = localStorage.getItem('token');
    const [users, setUsers] = useState(() => Array.isArray(members) ? members : []);
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    useEffect(() => {
        if (!members || members.length === 0) return;
        const getMemberUsers = async() => {
            try{
                const res = await axios.get(
                    `${API_URL}/users/usernames`,{ 
                        params: {userIds: members},
                        headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers(res.data);
            } catch(error) {
                console.error('Party Members couldnt be fetched', error.response ? error.response.data: error.message);
            }
        };
        getMemberUsers();
    },[token, members]);


    const userNames = users.map((user, ind) => {
        const id = members[ind];
        const isOwner = (id===CreatorId);
        const currUser = (userId===CreatorId);
        var imgsrc = urlprefab+user+"/Profile/ProfilePic";
        return(
            <div className='users-container'>
                <div className='pfp-mems'>
                    <img src={imgsrc} alt='pfp' onError={(e) => e.target.src = Pfp}/>
                </div>
                <p className={isOwner?('owner'):'usernames'} key={ind} onClick={()=>{navigate(`/profile/${user}`)}}>
                    @{user}
                </p>
                {
                    (currUser&&!isOwner)&&(<button className='kickbutton' onClick={() => handleKick(user)}>Kick</button>)
                }
            </div>
        );
    });

    const handleKick = async(member) => {
        try {
            const res = await axios.put(
            `${API_URL}/parties/${partyName}/${member}`, {},
            { headers: { Authorization: `Bearer ${token}` } }
            );
            refresh();
            refreshCurrent();

        } catch (error) {
            console.error('Party Members couldnt be kicked', error.response ? error.response.data: error.message);
        }
        
    }


    return(
        <>
        {isOpen? (
            <div className='overlay2'>
                <div className='member-overlay'>
                    <div className='top-portion'>
                        <h1 className='header'>Members</h1>
                        <button className='close' onClick={onClose}>X</button>
                    </div>
                     <div className='contents'>
                        {userNames}
                     </div>

                </div>

            </div>
        ):""}
        </>

    );
    

}

export default MembersOverlay;
