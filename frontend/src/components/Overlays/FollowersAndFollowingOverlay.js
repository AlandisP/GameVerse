import React, { useState, useEffect } from 'react';
import "../PF.css";
import "../Overlay.css";
import API_URL from '../../config/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pfp from '../../images/Profile.png'
import dots from '../../images/dots.png'
function FollowersAndFollowingOverlay({isOpen, Username, onClose, Tab, GetCounts}) {
    const token  = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const [activeTab, setActiveTab] = useState(Tab);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loggedFollowers, setLoggedFollowers] = useState([]);
    const [loggedFollowing, setLoggedFollowing] = useState([]);
    const[coor, setCoor] = useState({top:0, left:0});
    const[isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const [sentRequest, setSentRequest] = useState([]);

    

    const getFollowers = async() => {
        // user followers
        try {
            const res = await axios.get(
                `${API_URL}/users/followers/${Username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFollowers(res.data);  
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }

        // logged in user followers
        try {
            const res = await axios.get(
                `${API_URL}/users/followers/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoggedFollowers(res.data.map(u=>u.id));  
           // console.log(res.data);
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }
    }

    const handleOptionsClick = (e, user) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setIsPopupOpen(!isPopupOpen);
        setCoor({top: rect.top-30, left: rect.left+55});
        setSelectedUser(user);
    }


    const getFollowing = async() => {
        // Gets the current viewed profile following
        try {
            const res = await axios.get(
                `${API_URL}/users/following/${Username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFollowing(res.data);  
            //console.log(res.data);
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }

        // gets the logged in user following
        try {
            const res = await axios.get(
                `${API_URL}/users/following/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoggedFollowing(res.data.map(u=>u.id));  
           // console.log(res.data);
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }
    }

    const handleUnfollow = async(user) => {
        try {
            const res = await axios.post(
                `${API_URL}/profile/${user.username}/unfollow`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowing();
            GetCounts();
        } catch (error) {
            console.error("failed to unfollow user: ", error.response?.data || error.message);
        }   
    }

    const handleFollow = async(user)=>{
        try {
            const res = await axios.post(
                `${API_URL}/profile/${user.username}/follow`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowing();
            GetCounts();
            if(user.isPrivate) {
                setSentRequest((prev) => [...prev, user.username])
            }
        } catch (error) {
            console.error("failed to follow user: ", error.response?.data || error.message);
        }  
    }

    const handleCancelRequest = async(user) => {
        try{
            const res = await axios.post(
            `${API_URL}/users/cancelRequest/${user.username}`, {},
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setSentRequest((prev) => prev.filter((u) => u !== user.username));
        }catch(Error) {
            console.error("Error canceling request:", Error);
        }
    }


    const GetFollowedUsers = () => {
        const items = following.map((user, ind)=>
            <div key={ind} className='follower' onClick={() => {navigate(`/profile/${user.username}`); onClose();}}>
                <div className='circle'>
                    <img src={user.pfp?(user.pfp):Pfp} alt='userpfp'/>
                </div>
                <div className='info-holders'>
                    <h3>{user.username}</h3>
                    <p>{user.bio}</p>
                </div>
                {username===user.username?(<></>):
                loggedFollowing.includes(user.id)?(
                    <button className='pfpbutton2' onClick={(e) => {handleUnfollow(user); e.stopPropagation();}}><span>Following</span></button>
                    ):sentRequest.includes(user.username)?<button className='pfpbutton' onClick={(e) => {handleCancelRequest(user); e.stopPropagation();}}>Requested</button>:loggedFollowers.includes(user.id)?(
                        <button className='pfpbutton' onClick={(e) => {handleFollow(user); e.stopPropagation();}}>Follow Back</button>
                    ):<button className='pfpbutton' onClick={(e) => {handleFollow(user); e.stopPropagation();}}>Follow</button>
                }
            </div>
        );
        return(
            <div>
                {items.length!==0?(
                    <>
                        {items}
                    </>
                ):<p className='none-yet'>No user's are followed.</p>}
            </div>
        );
    }


    const GetFollowersUsers = () => {
        const items = followers.map((user, ind)=>
            <div key={ind} className='follower' onClick={() => {navigate(`/profile/${user.username}`); onClose();}}>
                {isPopupOpen && <PopUpMenu top={coor.top} left={coor.left} user={selectedUser} setPopUpMenu={setIsPopupOpen} getFollowers={getFollowers} GetCounts={GetCounts}/>}
                <div className='circle'>
                    <img src={user.pfp?(user.pfp):Pfp} alt='userpfp'/>
                </div>
                <div className='info-holders'>
                    <h3>{user.username}</h3>
                    <p>{user.bio}</p>
                </div>
                <div className='dotsw'>
                    {username===user.username?(<></>):
                    loggedFollowing.includes(user.id)?(
                        <button className='pfpbutton2' onClick={(e) => {handleUnfollow(user); e.stopPropagation();}}><span>Following</span></button>
                        ):sentRequest.includes(user.username)?<button className='pfpbutton' onClick={(e) => {handleCancelRequest(user); e.stopPropagation();}}>Requested</button>:loggedFollowers.includes(user.id)?(
                            <button className='pfpbutton' onClick={(e) => {handleFollow(user); e.stopPropagation();}}>Follow Back</button>
                        ):<button className='pfpbutton' onClick={(e) => {handleFollow(user);e.stopPropagation();}}>Follow</button>
                    }
                    {username===Username?(<img src={dots} alt='dots' className='dotsimg' onClick={(e) => handleOptionsClick(e, user)}/>):""}
                </div>
            </div>

        );
        return(
            <div>
                {items.length!==0?(
                    <>
                        {items}
                    </>
                ):<p className='none-yet'>No users are followers.</p>}
            </div>
        );
    }

    useEffect(() => {

    const getSentRequest = async() => {
        try {
            const res = await axios.get(`${API_URL}/users/requestSent`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSentRequest(res.data);
            console.log(res.data);
        } catch (error) {
            console.error("failed to get user data: ", error.response?.data || error.message);
        }
    }
    getSentRequest();
            const handleOutsideClick = () => {setIsPopupOpen(false);}
            document.addEventListener("click", handleOutsideClick);
            return () => document.removeEventListener("click", handleOutsideClick);
        }, []);

    useEffect(() =>{
        getFollowers();
        getFollowing();
    },[token]);

    useEffect(() => {
        setActiveTab(Tab);
    }, [Tab]);

    return (
        <>
        {isOpen?(
            <div className='overlay'>
                <div className='overlay-background-profile'>
                    <div className='top-portion2'>
                        <div className='subtop-portion'>
                            <h3>@{Username}</h3>
                             <button className='close2' onClick={onClose}>X</button>
                        </div>
                        <div className='tabs2'>
                            {["Following", "Followers"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {setActiveTab(tab);}}
                                    className={activeTab===tab?"tabs-sa":"tabs-s"}
                                >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {
                        activeTab==='Following'?(
                            <div className='followers-holder'>
                                <GetFollowedUsers/>
                            </div>
                        ):<div className='followers-holder'><GetFollowersUsers/></div>
                    }
                </div>

            </div>
        ):""}
        </>
    );

}

function PopUpMenu({ top, left, user, setPopUpMenu, getFollowers, GetCounts}) {
    const token = localStorage.getItem("token");

    const handleRemove = async(e) => {
        e.stopPropagation();
        try {
            const res = await axios.post(
                `${API_URL}/profile/removeFollower/${user.username}`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowers();
            GetCounts();
            setPopUpMenu(false);
        } catch (error) {
            console.error("failed to unfollow user: ", error.response?.data || error.message);
        }   
    }

    const blockUser = async(e) => {
        e.stopPropagation();
        try {
            const res = await axios.post (
                `${API_URL}/profile/block/${user.username}`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowers();
            setPopUpMenu(false);
        } catch (error) {
            console.error("failed to Block user: ", error.response?.data || error.message);
        }
    }


    return (
        <div className="popmenu-container" style={{ top, left, position: "fixed" }}>
            <ul className="popmenu">
                <p>{user.username}</p>
                <li className="kick" onClick={(e) => handleRemove(e)}>Remove Follower</li>
                <li className="kick" onClick={(e) => blockUser(e)}>Block</li>
                
            </ul>
        </div>
    );
}

export default FollowersAndFollowingOverlay;