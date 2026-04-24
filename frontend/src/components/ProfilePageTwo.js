import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";
import NavBar from "./NavBar";
import API_URL from "../config/api";
import PostObj from './Post'
import UploadBox from './MediaUpload';
import dots from "./../images/dots.png";
import "./Overlay.css";
import SignIn from "./../images/sits_01.png";
import lock from "./../images/lock-128.png";
import "./ProfilePage.css";
import FFOverlay from "./Overlays/FollowersAndFollowingOverlay";
function ProfilePageTwo() {
    const { username } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const loggedInUsername = localStorage.getItem("username");

    const [profile, setProfile] = useState(null);
    const [currUser, setCurrUser] = useState(null);
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [posts, setPosts] = useState([]);
    const [games, setGames] = useState([]);
    const [likedposts, setLikedPosts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const[coor, setCoor] = useState({top:0, left:0});
    const [blockIds, setBlockIds] = useState([]);
    const [userBlockIds, setUserBlockIds] = useState([]);
    const [mode, setMode] = useState("");
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("");
    const [followers, setFollowers] = useState([]);
    const [requests, setRequest] = useState([]);


    //Profile pictures code
    //#####################
    const [isUploading, enableUpload] = useState(0);
    const [pfp, setpfp] = useState(null);
    const [banner, setbanner] = useState(null);
    const [pfpUrl, setpfpUrl] = useState("");
    const [pfpUrltemp, setpfpUrlt] = useState("");
    const [bannerUrl, setbannerUrl] = useState("");
    const [bannerUrltemp, setbannerUrlt] = useState("");

    const getCurrentLoggedUser = async() => {
      const res = await axios.get(
        `${API_URL}/profile/${loggedInUsername}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrUser(res.data);

    }

    useEffect(() =>{
      getCurrentLoggedUser()
    },[token])

    useEffect(()=>{
      if(editMode&&pfp){
        setpfpUrlt(pfpUrl);
        setpfpUrl(URL.createObjectURL(pfp));
      }
      if(editMode&&!pfp&&pfpUrltemp!==""){
        setpfpUrl(pfpUrltemp);
        URL.revokeObjectURL(pfp);
      }
    },pfp);
    useEffect(()=>{
      if(editMode&&banner){
        setbannerUrlt(bannerUrl);
        setbannerUrl(URL.createObjectURL(banner));
      }
      if(editMode&&!banner&&bannerUrltemp!==""){
        setbannerUrl(bannerUrltemp);
        URL.revokeObjectURL(banner);
      }
    },banner);
    const cancelEdit = ()=>{
      if(pfp){
        setpfpUrl(pfpUrltemp);
        URL.revokeObjectURL(pfp);
        setpfp(null);
      }
      if(banner){
        setbannerUrl(bannerUrltemp);
        URL.revokeObjectURL(banner);
        setbanner(null);
      }
      setEditMode(false);
    }
    //#####################

    const parselike = (postinf)=>{
        const array = postinf["liked"];
        const like = array[loggedInUsername];
        return like;
    }

    const handleOptionsClick = (e) => {
      e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setIsOpen(!isOpen);
        setCoor({top: rect.top, left: rect.left-80});
        if(userBlockIds.includes(profile.id)) {
          setMode("Unblock");
        } else {
          setMode("Block");
        }
    }

    const GetUserPosts = async() => {
        try {
            if(username){
                const res = await axios.get(
                    `${API_URL}/post/${username}/posts`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPosts(res.data);
            } else {
                const res = await axios.get(
                    `${API_URL}/post/${loggedInUsername}/posts`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPosts(res.data);
            }
        } catch (error) {
            console.error("failed to get user's posts:", error.response?.data || error.message)
        }
    }

    const GetUserLikes = async() => {
      if(username) {
          const res = await axios.get (
            `${API_URL}/post/liked/${username}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setLikedPosts(res.data);
      } else {
          const res = await axios.get (
            `${API_URL}/post/liked/${loggedInUsername}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setLikedPosts(res.data);
      }
    }

    

    const ReadUserPosts = () => {
        const items = posts.map((post, index)=>{
             return <PostObj key={index} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
        });
        return(
            <div className="com-posts">
                {items}
            </div>
        );
    }
    const ReadUserMedia = () => {
      const items = posts.filter(post => post.media).map((post,index) => {
        if(post.media) {
          return <PostObj key={index} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
        }
      });
      return(
        <div className="com-posts">
          {items.length!==0?(
            <>
              {items}
            </>
          ):<p className="none-yet">No Media Uploaded yet</p>}
        </div>
      )
    }

    const ReadUserLikes = () => {
        const items = likedposts.map((post, index)=>{
             return <PostObj key={index} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
        });
        return(
            <div className="com-posts">
                {items}
            </div>
        );

    }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setPosts([]);     
        setLikedPosts([]);   
        setGames([]);        
        setProfile(null);    
        setpfpUrl("");   
        setbannerUrl(""); 
        let res;

        if (username) {
          // viewing someone else's profile
          res = await axios.get(
            `${API_URL}/profile/${username}`,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined
          );
          // gets the users blocked Ids(Viewed Profile)
          const res1 = await axios.get(
            `${API_URL}/profile/getBlockIds/${username}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setBlockIds(res1.data);
          const res2 = await axios.get(
            `${API_URL}/profile/getBlockIds/${loggedInUsername}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUserBlockIds(res2.data);
        } else {
          // viewing own profile
          res = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        setProfile(res.data);
        setBio(res.data.bio || "");
        if(res.data.pfp!=null)
        setpfpUrl(res.data.pfp);
        if(res.data.banner!=null)
        setbannerUrl(res.data.banner);
        
        // If viewing someone else's profile and logged in, fetch follow status
        if (username && token) {
          try {
            const followRes = await axios.get(
              `${API_URL}/profile/${username}/isFollowing`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFollowing(followRes.data === true);
          } catch (err) {
            console.error("Error checking follow status:", err);
          }
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          console.error("Error loading profile:", err);
        }
      } finally {
        setLoading(false);
      }
      GetUserPosts();
      GetUserLikes();
    };

    if (token || !username) {
      fetchProfile();
    } else {
      // No token and viewing someone else: still fetch public profile (no auth header)
      (async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}/profile/${username}`);
          setProfile(res.data);
          setBio(res.data.bio || "");
          setIsFollowing(false);
        } catch (err) {
          if (err.response?.status === 404) {
            setProfile(null);
          } else {
            console.error("Error loading profile:", err);
          }
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [username, token]);

  const handleSaveBio = async () => {
    try {
      await axios.put(
        `${API_URL}/profile`,
        { bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ ...profile, bio });
      if(pfp!=null||banner!=null){
        //console.log(pfp);
        const formdat = new FormData();
        formdat.append('pfp',pfp);
        formdat.append('banner',banner);
        await axios.post(
            `${API_URL}/profile/setmedia`,formdat,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        //console.log("media updated");
      }
      setEditMode(false);
    } catch (err) {
      alert("Error saving bio.");
    }
  };

  const handleFollow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/profile/${profile.username}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (profile.isPrivate) {
        setRequest((prev) => [...prev, loggedInUsername]); // adds to requests so button shows "Requested"
      } else {
        setIsFollowing(true);
        setProfile((prev) =>
          prev
            ? { ...prev, followerCount: (prev.followerCount || 0) + 1 }
            : prev
        );
      }
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/profile/${profile.username}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(false);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followerCount: Math.max((prev.followerCount || 1) - 1, 0),
            }
          : prev
      );
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const handleCancelRequest = async() => {
    try{
      const res = await axios.post(
        `${API_URL}/users/cancelRequest/${profile.username}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequest((prev) => prev.filter((u) => u !== loggedInUsername));
    }catch(Error) {
      console.error("Error canceling request:", Error);
    }
  }

  const handleUnblock = async() => {
    try {
      const res = await axios.post (
        `${API_URL}/profile/unblock/${profile.username}`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
    window.location.reload();
    } catch (error) {
      console.error("failed to unblock user: ", error.response?.data || error.message);
    }
    
  }

  useEffect(() => {
      const handleOutsideClick = () => {setIsOpen(false);}
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

    useEffect(() => {
      if(!profile) return;
      const GetUserSteamInfo = async() => {
        if(profile.steamId!==null) {
          try {
            const res = await axios.get(
              `${API_URL}/auth/steam/getOwnedGames/${profile.steamId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setGames(res.data.response.games);

          }catch(error) {
            console.error("failed to get steam info: ", error.response?.data || error.message);
          }
        }
      }
      GetUserSteamInfo();
      const getFollowers = async() => {
        try {
            const res = await axios.get(
                `${API_URL}/users/followers/${profile.username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFollowers(res.data.map(u=>u.id));  
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }
      }
      getFollowers();
      const getFollowRequest = async() => {
            const res = await axios.get(
                `${API_URL}/users/followRequest/${profile.username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequest(res.data);
        }
        getFollowRequest();
    },[profile]);

    const ReadUserGames = () => {
      const items = games.map((game, ind) => {
          return <ShownGames key={game.appid} Name={game.name} Image={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`} PlayTime={game.playtime_forever}/>
        }
      );
      return (
        <div>
          {items}
        </div>
      );
    }



  const Sidebar = () => <NavBar />;

  if (loading) {
    return (
      <div className="page-container">
        <Sidebar />
        <div className="main-content">
          <h2 style={{ color: "white" }}>Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <Sidebar />
        <div className="main-content">
          <h2 style={{ color: "white" }}>Profile not found.</h2>
        </div>
      </div>
    );
  }

  const isOwnProfile =
    !username || username.toLowerCase() === loggedInUsername?.toLowerCase();

  const handleDm = () => {
    // If you want to force login before DM:
    // if (!token) { navigate("/login"); return; }

    navigate("/messages", {
      state: {
        receiverUsername: profile.username,
      },
    });
  };


  const refreshCounts = async () => {
      try {
          const res = await axios.get(
              `${API_URL}/profile/${profile.username}`,
              { headers: { Authorization: `Bearer ${token}` } }
          );
          setProfile(prev => ({
              ...prev,
              followerCount: res.data.followerCount,
              followingCount: res.data.followingCount
          }));
      } catch (error) {
          console.error("failed to refresh counts: ", error);
      }
  }

  return (
    <div className="page-container">
      <Sidebar />
      <FFOverlay isOpen={isOverlayOpen} Username={profile.username} onClose={() => setIsOverlayOpen(false)} Tab={selectedTab} GetCounts={refreshCounts}/>
      <div className="main-content" style={{ color: "white" }}>
        {/* HEADER */}
        <div className="pfheader">
          {/* Banner */}
          <div
            style={{
              height: "190px",
              backgroundColor: "#3f4b5b",
              borderRadius: "0 0 12px 12px",
            }}
          >
          {bannerUrl!=="" ?
            <img src={bannerUrl} style={{
            width:"100%",
            height:"100%",
              objectFit: "fill"
            }}/>
            : "" }
          </div>

          {/* Avatar */}
          {pfpUrl==="" ? 
          <div
            style={{
              position: "absolute",
              top: "90px",
              left: "30px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "#1c1c1c",
              border: "4px solid #2f2f2f",
            }}
          ></div>
          :
          <img src={pfpUrl} style={{
              position: "absolute",
              top: "90px",
              left: "30px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "#1c1c1c",
              border: "4px solid #2f2f2f",
            }}/>
          }

          {/* Username + actions */}
          <div style={{ padding: "20px", marginTop: "0px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div className="username-row">
                  <h1 style={{ marginBottom: "5px" }}>{profile.username}</h1>
                  {profile.isPrivate && <img src={lock} alt="private img"/>}
                </div>
                <p style={{ marginTop: 0, color: "#aaaaaa" }}>
                  @{profile.username}
                </p>

                {/* Follower / Following counts */}
                <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                  <span className="flowhov" style={{ color: "#aaaaaa" }} onClick={()=> {setIsOverlayOpen(true); setSelectedTab('Following');}}>
                    <strong style={{ color: "white" }}>
                      {profile.followingCount ?? 0}
                    </strong>{" "}
                    Following
                  </span>
                  <span  className="flowhov" style={{ color: "#aaaaaa" }} onClick={()=> {setIsOverlayOpen(true); setSelectedTab('Followers')}}>
                    <strong style={{ color: "white" }}>
                      {profile.followerCount ?? 0}
                    </strong>{" "}
                    Followers
                  </span>
                </div>
              </div>

              {/* Right side */}
              {isOwnProfile ? (
                !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      marginTop: "10px",
                      padding: "10px 20px",
                      backgroundColor: "#058BFE",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Edit Profile
                  </button>
                )
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <img src={dots} alt="dots" className="dotsprofile" onClick={(e) => handleOptionsClick(e)}/>
                  {isOpen && <PopUpMenu top={coor.top} left={coor.left} setPopUpMenu={setIsOpen} Mode={mode}/>}
                  {!userBlockIds.includes(profile.id) && !blockIds.includes(currUser?.id)?(
                  <div>
                  <button
                    onClick={isFollowing?handleUnfollow :requests.includes(loggedInUsername)?handleCancelRequest:handleFollow}
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: isFollowing ? "#444" : "#058BFE",
                      color: "white",
                      border: "1px solid none",
                      borderRadius: "999px",
                      cursor: "pointer",
                      minWidth: "100px",
                      outline:"none",
                    }}
                  >
                    {isFollowing ? "Unfollow" : requests.includes(loggedInUsername)? "Requested":"Follow"}
                  </button>

                  <button
                    onClick={handleDm}
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: "#2d2d2d",
                      color: "white",
                      border: "1px solid #555",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    DM
                  </button>
                  </div>
                  ):userBlockIds.includes(profile.id)?<><button className="blockbtn" onClick={handleUnblock}><span>Blocked</span></button></>:""}
                </div>
              )}
            </div>

            {/* Bio */}
            {editMode ? (
              <>
              <div className="Profile-Media-Edit">
                <button onClick={()=>{enableUpload(1)}}>Edit Profile Picture</button>
                <button onClick={()=>{enableUpload(2)}}>Edit Banner</button>
              </div>
                <textarea
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="Bio-Edit"
                  style={{
                    width: "100%",
                    height: "80px",
                    borderRadius: "10px",
                    padding: "10px",
                    backgroundColor: "#444",
                    color: "white",
                  }}
                />
                <br />
                <button
                  onClick={handleSaveBio}
                  style={{
                    marginTop: "10px",
                    padding: "8px 15px",
                    backgroundColor: "#058BFE",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Save
                </button>

                <button
                  onClick={() => cancelEdit()}
                  style={{
                    marginLeft: "10px",
                    marginTop: "10px",
                    padding: "8px 15px",
                    backgroundColor: "#777",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <p style={{marginTop:"10px"}}>{profile.bio || "No bio yet."}</p>
            )}
          </div>
        </div>
        {/* TABS */}
        {userBlockIds.includes(profile?.id)?
          <div className="blankarea">
            <h1>You've blocked @{profile.username}</h1>
            <p>You will have to unblock this user to view their posts</p>
          </div>:blockIds.includes(currUser?.id)?
            <div className="blankarea">
              <h1>You've been blocked</h1>
              <p>You can't follow or see @{profile.username}'s posts 😔</p>
              </div>:profile.isPrivate && (!followers.includes(currUser?.id) && profile.username !== currUser?.username)?
                <div className="blankarea">
                  <h1>Account is Private</h1>
                  <p>You must request to follow the user to see their posts.</p>
                </div>
              :( 
            <div> 
            <div
              style={{
                borderBottom: "1px solid #444",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {["posts", "media", "likes","Steam Games"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "transparent",
                    color: activeTab === tab ? "#058BFE" : "#aaaaaa",
                    border: "none",
                    borderBottom:
                      activeTab === tab ? "3px solid #058BFE" : "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
        

          {/* TAB CONTENT */}
          {activeTab === "posts" && (
            <>
            {
              posts.length!==0?(
                  <ReadUserPosts/>
              ):<p className="none-yet"> No posts yet</p>
            }
            </>
          )}

          {activeTab === "media" && (
            <>
            {
              <ReadUserMedia/>
            }
            </>
          )}

          {activeTab === "likes" && (
            <>
            {
              likedposts.length!==0?(
                <ReadUserLikes/>
              ):<p className="none-yet"> No likes</p>
            }
            </>
          )}
          {activeTab==="Steam Games" &&(
            <>
            <div className="com-posts">
              {isOwnProfile&&profile.steamId==null?(
                <>
                <p className="none-yet">You must sign in with steam to show your achievements. Please click the link to sign into steam</p>
                <a href={`https://ccfrontend-production.up.railway.app/auth/steam?token=${token}`}>
                  <img src={SignIn} alt="steamlogin"/>
                </a> </>):profile.steamId===null?(<p className="none-yet">This user has not logged into steam</p>):<ReadUserGames/>
              }

            </div>
            </>
          )}
        </div>
        )}
      </div>
      {isUploading===1 ? <UploadBox clearvar={enableUpload} fileinf={{file:pfp,upload:setpfp}}/> : ''}
      {isUploading===2 ? <UploadBox clearvar={enableUpload} fileinf={{file:banner,upload:setbanner}}/> : ''}
    </div>
  );
}

  function PopUpMenu({ top, left, setPopUpMenu, Mode}) {
    const token = localStorage.getItem("token");
    const { username } = useParams();

    const blockUser = async() => {
      try {
        const res = await axios.post (
          `${API_URL}/profile/block/${username}`,
          {}, { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.reload();
      } catch (error) {
        console.error("failed to Block user: ", error.response?.data || error.message);
      }
    }

    const unblockUser = async() => {
      const res = await axios.post(
        `${API_URL}/profile/unblock/${username}`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
    }

    return (
        <div className="popmenu-container" style={{ top, left, position: "fixed" }}>
            <ul className="popmenu">
                {Mode === "Block"?(
                    <>
                      <li className="kick" onClick={blockUser}>Block</li>
                    </>
                ):<li className="promote" onClick={unblockUser}>Unblock</li>
                }
                
            </ul>
        </div>
    );
  }

function ShownGames({Name, Image, PlayTime}) {
  return (
    <div className="game-holder">
      <img src={Image} alt={Name}/>
      <div>
        <p className="name-head">{Name}</p>
        <p>{PlayTime} minutes played</p>
      </div>
    </div>
  );
}

export default ProfilePageTwo;