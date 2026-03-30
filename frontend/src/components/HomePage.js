import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'
import NavBar from "./NavBar";
import Pfp from '../images/Profile.png'
import axios from 'axios';
import PostObj from './Post'
import API_URL from '../config/api';
import clip from '../images/PaperClip.png'
import UploadBox from './MediaUpload';

const urlprefab = "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";

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
    const [uploadbox, setupload] = useState(false);
    const [uploadedFile, uploadFile] = useState(null);
    // const [uploadtype, setuploadtype] = useState("");
    const clipico = useRef(null);
    const [imgsrc, setimgsrc] = useState(urlprefab+username+"/Profile/ProfilePic");

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
            const formdat = new FormData();
            formdat.append('body',postbod);
            formdat.append('media',uploadedFile);
            const pid = await axios.post(
                `${API_URL}/post/makepost`,formdat,
                { headers: { Authorization: `Bearer ${token}` },timeout:0 }
            );
            setposts(posts => {
                const newArray = [...posts]; 
                const mediaurl = uploadedFile!=null ? URL.createObjectURL(uploadedFile) : null;
                const mediatypefile = uploadedFile!=null ? uploadedFile.type : "";
                newArray.unshift({user:username,text:postbod,likes:0,liked:{},id:pid.data,comments:[],media:mediaurl,mediaType:mediatypefile}); 
                return newArray; 
            });
            uploadFile(null);
        }
    }

    const getposts = async() =>{
        const result = await axios.get(
            `${API_URL}/post/getposts`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const bookmarks = await axios.get(`${API_URL}/post/getbooks`,
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
            //console.log(post);
                if(bookarray.includes(post["id"])){
                    return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={true} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
                }
                return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
        });
        return(
            <div>{items}</div>
        )
    }
    const bookarray = Array.from(bookmarks);
    const renderposts = posts.map((post,ind)=>{
        //console.log(post);
        if(bookarray.includes(post["id"])){
                return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={true} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
            }
            return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    });
    useEffect(()=>{
            getposts();
    },[]);
    //Updating the file visibility in the clip
    // useEffect(()=>{
    //     if(uploadFile){
    //         clipico.current.
    //     }
    // },[uploadFile]);
    return(
        <div className="page-container">
            <NavBar GetPosts={getposts}/>
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
                        <img className='PFP' src={imgsrc} onError={()=>{setimgsrc(Pfp)}}/>
                        <textarea rows='1' cols='50' maxLength={maxlen} ref={text} onChange={autoresize} placeholder='What are you thinking?'></textarea>
                        <img src={clip} className={`clip ${uploadedFile ? "hasfile" : ''}`} ref={clipico} onClick={()=>{setupload(true)}}/>
                        <button className='Post' onClick={makepost}>Post</button>
                    </div>
                    <div className='Content'>
                        {/* <Readposts/> */}
                        <div>{renderposts}</div>
                    </div>
                </div>
            </div>
            {uploadbox ? <UploadBox clearvar={setupload} fileinf={{file:uploadedFile,upload:uploadFile}}/> : ''}
        </div>
    );
}

export default HomePage;