import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../NavBar";
import API_URL from '../../config/api';
import "./CommunityStyles.css";
import "../Overlay.css";
import members from "../../images/members.png";
import dots from "../../images/dots.png";
import settings from "../../images/settings.png";
import PostObj from "../Post";
function CommunityPage() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const { community } = useParams();
    const [communityName, setCommunityName] = useState(community);
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
    const [popUpMenu, setPopUpMenu] = useState(false);
    const[coor, setCoor] = useState({top:0, left:0});
    const [selectedMember, setSelectedMember] = useState(null);
    const [mode, setMode] = useState("");
    const [settingsPop, setSettingsPop] = useState(false)
    const [settingsCoor, setSettingsCoor] = useState({top:0, left:0});
    const [isClosed1, setIsClosed1] = useState(true);
    const [isClosed2, setIsClosed2] = useState(true);
    const [isClosed3, setIsClosed3] = useState(true);
    const [posts, setPosts] = useState([]);

    const toggleEditing = () => {
        setEditing(!editing);
    }

    const getCommunityPosts = async() => {
        try {
            const res = await axios.get(
                `${API_URL}/post/${communityName}/community/posts`,
                 { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosts(res.data);
        } catch (error) {
            console.error("couldn't fetch posts")
        }
    }
    // Helper for likes
    const parselike = (postinf)=>{
        const array = postinf["liked"];
        const like = array[username];
        return like;
    }

    const ReadCommunityPost = () => {
        const items = posts.map((post, index)=>{
             return <PostObj key={index} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]}/>
        });
        return(
            <div className="com-posts">
                {items}
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
    const handleOptionsClick = (e, member) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setPopUpMenu(!popUpMenu);
        setCoor({top: rect.top, left: rect.left+80});
        setSelectedMember(member);

        if(activeTab === "members" && isOwner) {
            setMode("Owner(Members)");
        } else if(activeTab === "mods" && isOwner) {
            setMode("Owner(Mods)");
        } else if(activeTab === "members" && mods.includes(member)) {
            setMode("Moderator(Members)");
        }
    }

    const handleSettingsClick = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setSettingsPop(!settingsPop);
        setSettingsCoor({top: rect.top, left: rect.left+60});
    }
    
    useEffect(() => {
        const GetMembers = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/communities/${communityName}/Members`,
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
                    `${API_URL}/communities/${communityName}/Mods`,
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
                    `${API_URL}/communities/${communityName}`,
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
        getCommunityPosts();
    }, [token, communityName])

    const handleJoinClick = async() => {
        try {
            const res = await axios.put(
                `${API_URL}/communities/${communityName}/join`,
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
                `${API_URL}/communities/${communityName}/leave`,
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
                `${API_URL}/communities/${communityName}/editDescription`,
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

    useEffect(() => {
        const handleOutsideClick = () => {setPopUpMenu(false); setSettingsPop(false);}
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);
            
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
                { isOwner?(
                    <>
                    <ChangeNameOverlay isClosed={isClosed1} setIsClosed={setIsClosed1} setCommunityName={setCommunityName}/>
                    <TransferOwnershipOverlay isClosed={isClosed2} setIsClosed={setIsClosed2} setCurrCommunity={setCurrCommunity} membersCom={membersCom} mods={mods}/>
                    <DeleteCommunityOverlay isClosed={isClosed3} setIsClosed={setIsClosed3}/>
                    </>
                    ):""
                }
                <div className="main-content" style={{ color: "white" }}>
                    <div className="header-com">
                        <div className="banner"></div>
                        <div className="comavatar"></div>
                        <div className="comdetails">
                            <div className="header-top">
                                <h2>{communityName}</h2>
                                {isOwner?(
                                    <img src={settings} alt="settingsbtn" className="settings" onClick={(e) => handleSettingsClick(e)}/>):""
                                }
                            </div>
                            <span className="categorybox">{currCommunity.communityCategory}</span>
                            <p className="description-txt">{currCommunity.description}</p>
                            <div className="members-com">
                                <img src={members} alt="members" className="memberimg"/>
                                <p>{currCommunity.memberCount} Members</p>
                                {
                                    isOwner?(
                                        <button className="join-com" onClick={toggleEditing}>Edit Description</button>
                                    ): isMember || mods?.some(mod => mod.id === userId)?(
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
                                onClick={() => {setActiveTab(tab); setPopUpMenu(false);}}
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
                                        <div key={mod.id} className="userBlock" onClick={(e)=>{e.stopPropagation(); navigate(`/profile/${mod.username}`);}}>
                                            <div className="userCircle"></div>
                                            
                                            <p className="user-m">{mod.username}</p>
                                            {mod.id === currCommunity.ownerId?(
                                              <p className="displayBlock">Owner</p>
                                            ):<p className="displayBlock">Mod</p>}
                                            {mod.id !== currCommunity.ownerId && isOwner?(
                                                <div className="img-holder" onClick={(e) => handleOptionsClick(e, mod)}>
                                                    <img src={dots} alt="whitedots" className="dots"></img>
                                                </div>):""
                                            }
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
                                        {mods.some(mod => mod.id === userId)?(
                                            <div className="img-holder" onClick={(e) => handleOptionsClick(e, member)}>
                                                <img src={dots} alt="whitedots" className="dots"></img>
                                            </div>):""
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    }
                    {mods.some(mod => mod.id === userId)?(
                        popUpMenu && <PopUpMenu top={coor.top} left={coor.left} member={selectedMember} setMembers={setMembers} setPopUpMenu={setPopUpMenu} setMods={setMods} Mode={mode} setCurrCommunity={setCurrCommunity}/>):""
                    }
                    {
                        isOwner?(
                            settingsPop && <SettingsPopUp top={settingsCoor.top} left={settingsCoor.left} setIsClosed1={setIsClosed1} setIsClosed2={setIsClosed2} setIsClosed3={setIsClosed3}/>
                        ):""
                    }
                    
                </div>
            </div>
    );

}

function PopUpMenu({ top, left, member, setMembers, setPopUpMenu, setMods, Mode, setCurrCommunity }) {
    const token = localStorage.getItem("token");
    const { community } = useParams();

    const kickMember = async() => {
        try {
            const res = await axios.put (
                `${API_URL}/communities/${community}/${member.username}/kick`,
                {}, { headers: { Authorization: `Bearer ${token}` } }  
            );
            setMembers(prev => prev.filter(m => m.id !== member.id));
            setMods(prev => prev.filter(m => m.id !== member.id));
            setCurrCommunity(prev => ({ ...prev, memberCount: prev.memberCount - 1 }));
            setPopUpMenu(false);
        } catch (error) {
            console.error("failed to kick member: ", error.response?.data || error.message);
        }
    }
    
    const promoteMember = async() => {
        try {
            const res = await axios.put (
                `${API_URL}/communities/${community}/${member.username}/mod`,
                {}, { headers: { Authorization: `Bearer ${token}` } }  
            );
            setMembers(prev => prev.filter(m => m.id !== member.id));
            setMods(prev => [...prev, { id: member.id, username: member.username }])
            setPopUpMenu(false);
        } catch (error) {
             console.error("failed to promote member: ", error.response?.data || error.message);
        }
    }

    const demoteMember = async() => {
        try {
            const res = await axios.put (
                `${API_URL}/communities/${community}/${member.username}/demote`,
                {}, { headers: { Authorization: `Bearer ${token}` } } 
            );
            setMembers(prev => [...prev, { id: member.id, username: member.username }]);
            setMods(prev => prev.filter(m => m.id !== member.id));
            setPopUpMenu(false);
            
        } catch (error) {
            console.error("failed to demote member: ", error.response?.data || error.message);
        }
    }

    return (
        <div className="popmenu-container" style={{ top, left, position: "fixed" }}>
            <ul className="popmenu">
                {Mode === "Owner(Members)"?(
                    <>
                        <li className="promote" onClick={promoteMember}>Promote</li>
                        <li className="kick" onClick={kickMember}>Kick</li>
                    </>
                ):Mode === "Owner(Mods)"?(
                    <>
                        <li className="promote" onClick={demoteMember}>Demote</li>
                        <li className="kick" onClick={kickMember}>Kick</li>
                    </>
                ):(
                    <>
                        <li className="kick" onClick={kickMember}>Kick</li>
                    </>
                )
                }
                
            </ul>
        </div>
    );
}

function SettingsPopUp({top, left, setIsClosed1, setIsClosed2, setIsClosed3}) {
    return (
        <div className="popmenu-container" style={{ top, left, position: "fixed" }}>
            <ul className="popmenu">
                <li className="promote" onClick={() => setIsClosed1(false)}>Change Name</li>
                <li className="promote" onClick={() => setIsClosed2(false)}>Transfer Ownership</li>
                <li className="kick" onClick={() => setIsClosed3(false)}> Delete Community</li>
            </ul>
        </div>
    );
}

function ChangeNameOverlay({isClosed, setIsClosed, setCommunityName}) {
    const token = localStorage.getItem("token");
    const {community} = useParams();
    const [newName, setNewName] = useState("");
    const navigate = useNavigate();

    const handleNameChange = async() => {
        try {
            const res = await axios.put(
            `${API_URL}/communities/${community}/editName`,
            {name: newName}, { headers: { Authorization: `Bearer ${token}` } } 
            )
            setCommunityName(newName);
            setIsClosed(true);
            navigate(`/communities/${newName}`);
        } catch (error) {
            console.error("failed to change community name: ", error.response?.data || error.message);
        }
        
    }

    return(
        <>
        {!isClosed?(
            <div className='overlay'>
                <div className="overlay-rect">
                    <h2>Change Community Name</h2>
                    <p>Current Name: {community}</p>
                    <input placeholder="Enter new Community Name" type="text" className="input-name" onChange={(e) => setNewName(e.target.value)}/>
                    <div className="updates">
                        <button className="update" onClick={handleNameChange}>Update Name</button>
                        <button className="cancel-overlay" onClick={() => setIsClosed(true)}>Cancel</button>
                    </div>
                </div>
            </div>
        ):""
        }
    </>
    )

}

function TransferOwnershipOverlay({isClosed, setIsClosed, setCurrCommunity, membersCom, mods}) {
    const token = localStorage.getItem("token");
    const {community} = useParams();
    const [user, setUser] = useState("");
    const [clicks, setClicks] = useState(0);

    const handleClicks = async() => {
        const newClicks = clicks + 1;
        setClicks(newClicks)
        if(newClicks >= 2) {
            try {
                const res = await axios.put(
                `${API_URL}/communities/${community}/TransferOwnership`,
                {username: user}, { headers: { Authorization: `Bearer ${token}` } } 
                );
                setClicks(0);
                setIsClosed(true);
                // const newOwner = membersCom.find(m => m.username === user) || mods.find(m => m.username === user);
                // setCurrCommunity(prev => ({ ...prev, ownerId: newOwner.id }));
                window.location.reload();
                
            } catch (error) {
                console.error("failed to transfer ownership ", error.response?.data || error.message);
            }
            
        }
    }

    return(
        <>
        {!isClosed?(
            <div className='overlay'>
                <div className="overlay-rect">
                    <h2>Transfer Ownership</h2>
                    <p>User must currently be in the community</p>
                    <input placeholder="Enter new owner username" type="text" className="input-name" onChange={(e) => setUser(e.target.value)}/>
                    <div className="updates">
                        <button className="update" onClick={handleClicks}>Transfer</button>
                        <button className="cancel-overlay" onClick={() => {setIsClosed(true); setClicks(0);}}>Cancel</button>
                    </div>
                    {
                        clicks>=1? (
                            <p style={{color:'red'}}>Are you sure? This action can't be undone.</p>
                        ):""
                    }
                </div>
            </div>
        ):""
        }
    </>
    )
}

function DeleteCommunityOverlay({isClosed, setIsClosed}) {
    const token = localStorage.getItem("token");
    const {community} = useParams();
    const [comName, setComName] = useState("");
    const [clicks, setClicks] = useState(0);
    const navigate = useNavigate();

    const handleClicks = async() => {
        const newClicks = clicks + 1;
        setClicks(newClicks)
        if(newClicks >= 2) {
            try {
                const res = await axios.delete(
                `${API_URL}/communities/delete`,
                {
                    data: {name: comName},  
                    headers: { Authorization: `Bearer ${token}` }
                } 
                );
                navigate('/communities');
                setClicks(0);
                setIsClosed(true);
                
                
            } catch (error) {
                console.error("failed to delete community ", error.response?.data || error.message);
            }
            
        }
    }

    return(
        <>
        {!isClosed?(
            <div className='overlay'>
                <div className="overlay-rect">
                    <h2>Delete Community</h2>
                    <p>Enter the exact name of the community</p>
                    <input placeholder="Enter the name of the community to confirm:" type="text" className="input-name" onChange={(e) => setComName(e.target.value)}/>
                    <div className="updates">
                        <button className="delete-com" onClick={handleClicks}>Delete</button>
                        <button className="cancel-overlay" onClick={() => {setIsClosed(true); setClicks(0);}}>Cancel</button>
                    </div>
                    {
                        clicks>=1? (
                            <p style={{color:'red'}}>Are you sure? This action can't be undone.</p>
                        ):""
                    }
                </div>
            </div>
        ):""
        }
    </>
    )
}

export default CommunityPage;