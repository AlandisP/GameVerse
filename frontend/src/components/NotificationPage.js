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
dayjs.extend(relativeTime);

function NotificationPage() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const [notifications, setNotifications] = useState([]);
    

    useEffect(() => {
        const getNotis = async() => {
            const res = await axios.get(
                `${API_URL}/notifications/${username}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(res.data)
        };
        getNotis();
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