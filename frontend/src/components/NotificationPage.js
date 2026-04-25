import NavBar from "./NavBar";
import "./notifications.css";
import bell from "../images/bellnoti.png";
import followed from "../images/followernoti.png";
import { useEffect, useState } from "react";
import API_URL from "../config/api";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Pfp from '../images/Profile.png';
import check from '../images/checksym.png';
import xsym from '../images/exsym.png';
import trashcan from '../images/trashcan.png';
dayjs.extend(relativeTime);

function NotificationPage() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const [notifications, setNotifications] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loggedFollowers, setLoggedFollowers] = useState([]);
    const [loggedFollowing, setLoggedFollowing] = useState([]);
    const navigate = useNavigate();
    const [currUser, setCurrUser] = useState(null);
    const [requests, setRequest] = useState([]);
    const [myRequest, setMyRequest] = useState([]);

    const handleFollow = async(user)=>{
        try {
            const res = await axios.post(
                `${API_URL}/profile/${user.username}/follow`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowing();
            if(user.isPrivate) {
                setRequest((prev) => [...prev, user.username])
            }
        } catch (error) {
            console.error("failed to follow user: ", error.response?.data || error.message);
        }  
    }

    const handleUnfollow = async(user) => {
        try {
            const res = await axios.post(
                `${API_URL}/profile/${user.username}/unfollow`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowing();
        } catch (error) {
            console.error("failed to unfollow user: ", error.response?.data || error.message);
        }   
    }

    const getFollowers = async() => {
        // logged in user followers
        try {
            const res = await axios.get(
                `${API_URL}/users/followers/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoggedFollowers(res.data.map(u=>u.id));  
            //console.log(res.data);
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }
    }

    const getFollowing = async() => {
        // gets the logged in user following
        try {
            const res = await axios.get(
                `${API_URL}/users/following/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoggedFollowing(res.data.map(u=>u.id));  
            //console.log(res.data);
        } catch (error) {
            console.error("failed to get users: ", error.response?.data || error.message);
        }
    }

    const handleRequestResponse = async(user, status) => {
        try{
            const res = await axios.post(
                `${API_URL}/users/request/${user.username}`, null,
                {
                params:{choice: status}, headers: { Authorization: `Bearer ${token}` } 
                }
            );
            setMyRequest((prev) => prev.filter((u) => u.username !== user.username))
        } catch(error) {
            console.error("Error:", error.response.data);
        }
    }

    const handleCancelRequest = async(user) => {
        try{
            const res = await axios.post(
            `${API_URL}/users/cancelRequest/${user.username}`, {},
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequest((prev) => prev.filter((u) => u !== user.username));
        }catch(Error) {
            console.error("Error canceling request:", Error);
        }
    }

    useEffect(() => {
        const getNotis = async() => {
            const res = await axios.get(
                `${API_URL}/notifications/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(res.data)
        };
        getNotis();
        const getRecommendations = async() => {
            const res = await axios.get(
                `${API_URL}/notifications/recommendations`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecommendations(res.data);
            //console.log(res.data);
        }
        getRecommendations();
        getFollowers();
        getFollowing();
        const getCurrentLoggedUser = async() => {
            const res = await axios.get(
                `${API_URL}/profile/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrUser(res.data);
        }
        getCurrentLoggedUser();

        const getFollowRequests = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/users/requestSent`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRequest(res.data);
                console.log(res.data);
            } catch (error) {
                console.error("failed to get follow requests: ", error.response?.data || error.message);
            }
        };
        getFollowRequests();

        const getMyRequest = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/users/followRequest/${username}`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMyRequest(res.data);
                console.log(res.data);

            } catch(error) {
                console.error("Failed to get your request:" , error.response.data || error.message);
            }
        }
        getMyRequest();
    },[token]);

    const ReadNotis = () => {
        const items = notifications.map((noti, ind) => (
            <Notification key={ind} Type={noti.type} Message={noti.message} CreatedAt={noti.createdAt} id={noti.id} setNotifications={setNotifications}/>
        ));
        return (
            notifications.length !== 0?(
                <div>{items}</div>
            ): <div>
                <p className="no-notis"> No Current Notifications</p>
            </div>
        );
    }

    const ReadRecs = () => {
        const items = recommendations.map((user,ind) => (
            <div key={ind} className="userrec" onClick={() => navigate(`/profile/${user.username}`)}>
                <div className='circle'>
                    <img src={user.pfp?(user.pfp):Pfp} alt='userpfp'/>
                </div>
                <div className='info-holders'>
                    <h3>{user.username}</h3>
                    <p>{user.bio}</p>
                </div>
                {
                    loggedFollowing.includes(user.id)?(
                    <button className='pfpbutton2' onClick={(e) => {handleUnfollow(user); e.stopPropagation();}}><span>Following</span></button>
                    ):requests.includes(user.username)?<button className="pfpbutton" onClick={(e) =>{e.stopPropagation(); handleCancelRequest(user)}}>Requested</button>:loggedFollowers.includes(user.id)?(
                        <button className='pfpbutton' onClick={(e) => {handleFollow(user); e.stopPropagation();}}>Follow Back</button>
                    ):<button className='pfpbutton' onClick={(e) => {handleFollow(user); e.stopPropagation();}}>Follow</button>
                }
            </div>
        ));
        return(
            <div>
                {items}
            </div>
        );
    }

    const ReadReqs = () => {
        const items = myRequest.map((user, ind) => (
            <div  key={ind} className="user-holderreq" onClick={() => navigate(`/profile/${user.username}`)}>
                <div className="pfp-holder"><img src={user.pfp?(user.pfp):Pfp} alt='userpfp' className="reqimg"/></div>
                <div className="desc-col">
                    <h3>{user.username}</h3>
                    <p>{user.bio}</p>
                </div>
                <div className="btn-section">
                    <button className="circbutton"><img  className='symbol' src={check} alt="check" onClick={(e) => {handleRequestResponse(user, true); e.stopPropagation()}}/></button>
                    <button className="circbutton2"><img  className='symbol' src={xsym} alt="x"  onClick={(e) => {handleRequestResponse(user, false); e.stopPropagation()}}/></button>
                </div>
            </div>
        ));
        return(
            <div>
                {items}
            </div>
        )
    }

    const ReadRequests = () => {

    }

    return (
        <div className="page-container">
            <NavBar/>
            <div className="main-content">
                <div style={{ top:0,zIndex:10,borderBottom: "1px solid #000000ff", paddingBottom: "10px",marginLeft: "-20px", paddingLeft: "20px", position:"fixed", left:"250px", right:"0" }}>
                    <h1 style={{ color: "white", textAlign: "left",marginTop: "11px",marginLeft: "20px",marginBottom: "0"}}>Notifications</h1>
                </div>
                 <div style={{ height: "60px" }}></div>
                 <div className="notifications">
                    <div className="container">
                        <ReadNotis/>
                    </div>
                    <div className="extras">
                        <h2 className="header-1">Who to Follow</h2>
                        <div className="rec-holder">
                            <ReadRecs/>
                        </div>
                        { currUser?.isPrivate  && <h2>Follow Request</h2>}
                        <div className="req-holder">
                            {/* <div className="user-holderreq">
                                <div className="pfp-holder"></div>
                                <div className="desc-col">
                                    <h3>Test text</h3>
                                    <p>descriptionfeshgoFHKhjKf</p>
                                </div>
                                <div className="btn-section">
                                    <button className="circbutton"><img  className='symbol' src={check} alt="check"/></button>
                                    <button className="circbutton2"><img  className='symbol' src={xsym} alt="x"/></button>
                                </div>
                            </div> */}
                            <ReadReqs/>

                        </div>
                    </div>

                 </div>
            </div>
        </div>
    );

}

function Notification({Type, Message, CreatedAt, id, setNotifications}) {
    const ref = useRef();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const user = Message.split(" ")[0];
    const img = Type==='Profile' ? followed: bell;
    const deleted = useRef(false);

    const HandleConditionalClick = () => {
        if(Type === 'Party') {
            navigate('/partyfinder');
        } else if (Type === 'Post') {
            navigate('/home');
        }
    }

    const handleDelete = async(e) => {
        const res = await axios.delete(
            `${API_URL}/notifications/deleteNoti/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(prev => prev.filter(n => n.id !== id));

    }

    // This logic is called whenever the page is view(will research later)
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !deleted.current) {
                axios.post(
                    `${API_URL}/notifications/markRead/${id}`, {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                observer.disconnect(); // prevent multiple calls
            }
        });

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [id, token]);

    return (
        <div className="noti-container" ref={ref}>
            <div className="noti" onClick={HandleConditionalClick}>
                <img src={img} alt='bell' className="noti-img"/>
                <div className="noti-text">
                    <h3>{Type}</h3>
                    <p className="message-txt" onClick={(e)=>{e.stopPropagation(); navigate(`/profile/${user}`)}}>{Message}</p>
                </div>
                <div className="right-side">
                    <p>{dayjs(CreatedAt).fromNow()}</p>
                    <img src={trashcan} alt="trashcan" className="trashcan" onClick={(e) => {e.stopPropagation(); handleDelete();}}/>
                </div>
            </div>
        </div>
    );
}

export default NotificationPage;