import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'
import NavBar from "./NavBar";
import Pfp from '../images/Profile.png'
import axios from 'axios';
import PostObj from './Post'

function HomePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('home');
    const text = useRef(null);
    const maxlen = 300;
    const [postbod, setpostbod] = useState("");
    const [posts, setposts] = useState([]);
    const [bookmarks, setbooks] = useState([]);
    const [canref, refresh] = useState(0);

    const handleNavClick = (e, path, tabId) => {
        e.preventDefault();
        setActiveTab(tabId);
        navigate(path);

    };

    const handleLogout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    }

    const autoresize = (e) =>{
        text.current.style.height = "fit-content";
        text.current.style.height = `${text.current.scrollHeight}px`;
        setpostbod(e.target.value);
    }
    
    const makepost = async () =>{
        if(postbod!=""){
            const pid = await axios.post(
                'http://localhost:8080/post/makepost',{body:postbod},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setposts(posts => {
                const newArray = [...posts]; 
                newArray.unshift({user:username,text:postbod,likes:0,liked:{},id:pid.data}); 
                return newArray; 
            });
        }
    }

    const getposts = async() =>{
        const result = await axios.get(
            'http://localhost:8080/post/getposts',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const bookmarks = await axios.get('http://localhost:8080/post/getbooks',
            { headers: { Authorization: `Bearer ${token}` } });
        setbooks(bookmarks.data);
        setposts(result.data);
        //setbooks(bookmarks.data);

    }

    const parselike = (postinf)=>{
        const array = postinf["liked"];
        const like = array[username];
        return like;
    }

    const Readposts = () => {
        const bookarray = Array.from(bookmarks);
        const items = posts.map((post,ind)=>{
                if(bookarray.includes(post["id"])){
                    return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={true}/>
                }
                return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false}/>
        });
        return(
            <div>{items}</div>
        )
    }
    useEffect(()=>{
            getposts();
    },[]);
    return(
        <div className="page-container">
            <NavBar/>
            <div className="main-content">
    <div style={{ 
        borderBottom: "1px solid #000000ff", 
        paddingBottom: "10px",
        marginLeft: "-20px", 
        paddingLeft: "20px" 
    }}>
        <h1 style={{ 
            color: "white", 
            textAlign: "left",
            marginTop: "50px",
            marginLeft: "20px",
            marginBottom: "0"
        }}>
            Feed
        </h1>
    </div>
    <div id='Post-Body'>
        {/* <h3 style={{ color: "white", textAlign: "center" }}>
            Welcome {username}, you are logged in!
        </h3> */}
        <div className='Post-Bar'>
            <img className='PFP' src={Pfp}/>
            <textarea rows='1' cols='50' maxLength={maxlen} ref={text} onChange={autoresize} placeholder='What are you thinking?'></textarea>
            <button className='Post' onClick={makepost}>Post</button>
        </div>
        <div className='Content'>
            <Readposts/>
        </div>
    </div>
</div>
        </div>
    );
}

export default HomePage;