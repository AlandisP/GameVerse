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
import Pfp from '../images/Profile.png'
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

    const handleFollow = async(userName)=>{
        try {
            const res = await axios.post(
                `${API_URL}/profile/${userName}/follow`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getFollowing();
        } catch (error) {
            console.error("failed to follow user: ", error.response?.data || error.message);
        }  
    }

    const handleUnfollow = async(userName) => {
        try {
            const res = await axios.post(
                `${API_URL}/profile/${userName}/unfollow`,{},
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

        const getFollowRequest = async() => {
            const res = await axios.get(
                `${API_URL}/users/followRequest/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequest(res.data);
        }
        getFollowRequest();
    },[token]);

    const ReadNotis = () => {
        const items = notifications.map((noti, ind) => (
            <Notification key={ind} Type={noti.type} Message={noti.message} CreatedAt={noti.createdAt} id={noti.id}/>
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
                    <button className='pfpbutton2' onClick={(e) => {handleUnfollow(user.username); e.stopPropagation();}}><span>Following</span></button>
                    ):loggedFollowers.includes(user.id)?(
                        <button className='pfpbutton' onClick={(e) => {handleFollow(user.username); e.stopPropagation();}}>Follow Back</button>
                    ):<button className='pfpbutton' onClick={(e) => {handleFollow(user.username); e.stopPropagation();}}>Follow</button>
                }
            </div>
        ));
        return(
            <div>
                {items}
            </div>
        );
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
                    </div>

                 </div>
            </div>
        </div>
    );

}

function Notification({Type, Message, CreatedAt, id}) {
    const ref = useRef();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const user = Message.split(" ")[0];
    const img = Type==='Profile' ? followed: bell;

    const HandleConditionalClick = () => {
        if(Type === 'Party') {
            navigate('/partyfinder');
        } else if (Type === 'Post') {
            navigate('/home');
        }
    }

    // This logic is called whenever the page is view(will research later)
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
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
                </div>
            </div>
        </div>
    );
}

export default NotificationPage;