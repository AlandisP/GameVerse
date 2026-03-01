import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../NavBar";
import API_URL from '../../config/api';
import "./CommunityStyles.css";
import members from "../../images/members.png";
function CommunityPage() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const { community } = useParams();
    const [currCommunity, setCurrCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const isOwner = (userId===currCommunity?.ownerId);
    const[editing, setEditing] = useState(false);
    const[bio, setBio] = useState("");
    const [mods, setMods] = useState([]);
    const [membersCom, setMembers] = useState([]);
    const isMember = membersCom?.some(member => member.id === userId);
    const navigate = useNavigate();

    const toggleEditing = () => {
        setEditing(!editing);
    }

    const ReadCommunityPost = () => {
        return(
            <div>
                <h1>Community Posts will go here</h1>
            </div>
        );
    }

    const ReadCommunityMedia = () => {
        return(
            <div>
                <h1>Post Media Will go here</h1>
            </div>
        );
    }

    const ReadCommunityMods = () => {
        return(
            <div>
                <h1>Mods</h1>
            </div>
        );
    }

    

    useEffect(() => {
        const GetMembers = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/communities/${community}/Members`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMembers(res.data);
                
            } catch (error) {
                console.error("Couldn't fetch the members")
            }
        }
        GetMembers();
        const GetModerators = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/communities/${community}/Mods`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMods(res.data);

            } catch(error) {
                
                console.error("couldn't fetch mods")
            }
        }
        GetModerators();
        const GetCommunity = async() => {
            try{
                const res = await axios.get(
                    `${API_URL}/communities/${community}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCurrCommunity(res.data);
                setLoading(false);
                setBio(res.data.description);
            } catch(error) {
                console.error("failed to get community:", error.response?.data || error.message)
            }
        }
        GetCommunity();
    }, [token, community])

    const handleJoinClick = async() => {
        try {
            const res = await axios.put(
                `${API_URL}/communities/${community}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers(prev => [...prev, { id: userId, username: username }]);
            // Update member count
            setCurrCommunity(prev => ({
                ...prev,
                memberCount: prev.memberCount + 1
            }));
        } catch (error) {
            console.error("failed to join community: ", error.response?.data || error.message);
        }
    }

    const handleLeaveClick = async() => {
        try {
            const res = await axios.put(
                `${API_URL}/communities/${community}/leave`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove the user from membersCom
            setMembers(prev => prev.filter(member => member.id !== userId));
            // Update member count
            setCurrCommunity(prev => ({
                ...prev,
                memberCount: prev.memberCount - 1
            }));
        } catch(error) {
            console.error("failed to leave community: ", error.response?.data || error.message);
        }
    }

    const handleSaveDescription = async() => {
        try {
            const res = await axios.put(
                `${API_URL}/communities/${community}/editDescription`,
                {description: bio}, { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrCommunity(prev => ({
                ...prev,
                description: bio
            }));
            setEditing(false);

        } catch(error) {
            console.error("failed to save new description: ", error.response?.data || error.message);
        }
    }
        
        if (loading) return (
            <div className="page-container">
                <NavBar/>
                <div className="main-content">
                    <div className="loading">Loading...</div>
                </div>
            </div>
            
        );

        return (
            
            <div className="page-container">
                <NavBar/>
                <div className="main-content" style={{ color: "white" }}>
                    <div className="header-com">
                        <div className="banner"></div>
                        <div className="comavatar"></div>
                        <div className="comdetails">
                            <h2>{community}</h2>
                            <span className="categorybox">{currCommunity.communityCategory}</span>
                            <p className="description-txt">{currCommunity.description}</p>
                            <div className="members-com">
                                <img src={members} alt="members" className="memberimg"/>
                                <p>{currCommunity.memberCount} Members</p>
                                {
                                    isOwner?(
                                        <button className="join-com" onClick={toggleEditing}>Edit Description</button>
                                    ): isMember?(
                                        <button className="leave-com" onClick={handleLeaveClick}>Leave</button>
                                    ):<button className="join-com" onClick={handleJoinClick}>Join</button>
                                }
                            </div>
                            {
                                editing?(
                                    <div>
                                        <textarea className="editcomdesc" onChange={(e) => setBio(e.target.value)} value={bio}/>
                                        <div className="editingbtns">
                                            <button className="save" onClick={handleSaveDescription}>Save</button>
                                            <button className="cancel" onClick={toggleEditing}>Cancel</button>
                                        </div>
                                    </div>
                                ): ""
                            }
                        </div>
                        
                    </div>
                    <div className="tabs">
                        {["posts", "media", "members", "mods"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={activeTab===tab?"tabs-sa":"tabs-s"}
                            >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}

                            </button>
                        ))}
                    </div>
                    {
                        activeTab==="posts"?(
                            <ReadCommunityPost/>
                        ):activeTab==="media"?(
                            <ReadCommunityMedia/>
                        ):activeTab==="mods"?(
                            <div  className="memholder">
                                {
                                    mods.map(mod =>(
                                        <div key={mod.id} className="userBlock" onClick={(e)=>{e.stopPropagation(); navigate(`/profile/${mod.username}`)}}>
                                            <div className="userCircle"></div>
                                            <p className="user-m">{mod.username}</p>
                                            {mod.id === currCommunity.ownerId?(
                                              <p className="displayBlock">Owner</p>
                                            ):<p className="displayBlock">Mod</p>}
                                        </div>
                                    ))
                                }
                            </div>
                        ):<div className="memholder">
                            {
                                membersCom.map(member =>(
                                    <div key={member.id} className="userBlock" onClick={(e)=>{e.stopPropagation(); navigate(`/profile/${member.username}`)}}>
                                        <div className="userCircle"></div>
                                        <p className="user-m">{member.username}</p>
                                    </div>
                                ))
                            }
                        </div>
                    }
                </div>
            </div>
    );

}

export default CommunityPage;