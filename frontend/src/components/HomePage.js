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
    const [activeTab, setActiveTab] = useState('General');
    const [platform, setSelectedValue] = useState('');
    const text = useRef(null);
    const maxlen = 300;
    const [postbod, setpostbod] = useState("");
    const [posts, setposts] = useState([]);
    const [followingPosts, setFollowingPosts] = useState([]);
    const [bookmarks, setbooks] = useState([]);
    const [canref, refresh] = useState(0);
    const [uploadbox, setupload] = useState(false);
    const [uploadedFile, uploadFile] = useState(null);
    const clipico = useRef(null);
    const [imgsrc, setimgsrc] = useState(urlprefab+username+"/Profile/ProfilePic");
    const [posting, makingpost] = useState(false);
    const autoresize = (e) =>{
        text.current.style.height = "fit-content";
        text.current.style.height = `${text.current.scrollHeight}px`;
        setpostbod(e.target.value);
    }
    
    const makepost = async () =>{
        if(postbod!=""||uploadedFile!=null&&!posting){
            makingpost(true);
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
            text.current.value = "";
            setpostbod("");
            makingpost(false);
        }
    }

    const HandleChange = (e) => {
        setSelectedValue(e.target.value);
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
        console.log(result.data);
        //setbooks(bookmarks.data);
    }

    const getFollowingPosts = async() =>{
        const res = await axios.get(
            `${API_URL}/post/getFollowingPosts`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowingPosts(res.data);
    }

    const parselike = (postinf)=>{
        const array = postinf["liked"];
        const like = array[username];
        return like;
    }

    // const Readposts = () => {
    //     const bookarray = Array.from(bookmarks);
    //     const items = posts.map((post,ind)=>{
    //         //console.log(post);
    //             if(bookarray.includes(post["id"])){
    //                 return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={true} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    //             }
    //             return <PostObj key={ind} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={false} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    //     });
    //     return(
    //         <div>{items}</div>
    //     )
    // }
    const bookarray = Array.from(bookmarks);
    // This lovely code here causes a bug, commenting out to prevent deleting, however keeping it for reference
    // ######################################

    // const GetAllPosts = () => {
    //     const filtered = (platform? posts.filter(p=>p.tag===platform):posts);
    //     const renderposts = filtered.map((post,ind)=>{
    //         const isbookd = bookarray.includes(post["id"]) ? true : false;
    //         return <PostObj key={post["id"]} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={isbookd} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    //     });
    //     return (
    //         <div>{renderposts}</div>
    //     );
    // }
    // const GetAllFollowingPosts = () => {
    //     const filtered = (platform? followingPosts.filter(p=>p.tag===platform):followingPosts);
    //     const renderfollowingposts = filtered.map((post,ind)=>{
    //         const isbookd = bookarray.includes(post["id"]) ? true : false;
    //         return <PostObj key={post["id"]} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={isbookd} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    //     });
    //     return(
    //         <div>
    //             {renderfollowingposts.length>0?(
    //                 {renderfollowingposts}
    //             ):<p className='none-yet'>There are no posts dedicated to this category😔</p>}
    //         </div>
    //     );
    // }
    const filtered = (platform? posts.filter(p=>p.tag===platform):posts);
    const filteredfollow = (platform? followingPosts.filter(p=>p.tag===platform):followingPosts);
    const GetAllPosts =  filtered.map((post,ind)=>{
        const isbookd = bookarray.includes(post["id"]) ? true : false;
        return <PostObj key={post["id"]} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={isbookd} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    });
    const GetAllFollowingPosts = filteredfollow.map((post,ind)=>{
        const isbookd = bookarray.includes(post["id"]) ? true : false;
        return <PostObj key={post["id"]} User={post["user"]} Content={post["text"]} Likes={post["likes"]} Liked={parselike(post)} id={post["id"]} commcount={post["comments"].length} books={isbookd} CreatedAt={post["createdAt"]} CommunityName={post["communityName"]} media={post["media"]} type={post["mediaType"]}/>
    });
    useEffect(()=>{
            getposts();
            getFollowingPosts();
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
                     <div className='tabs'>
                        {["General", "Following"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {setActiveTab(tab);}}
                                className={activeTab===tab?"tabs-sa":"tabs-s"}
                            >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className='Post-Bar'>
                        <img className='PFP' src={imgsrc} onError={()=>{setimgsrc(Pfp)}}/>
                        <textarea rows='1' cols='50' maxLength={maxlen} ref={text} onChange={autoresize} placeholder='What are you thinking?'></textarea>
                        <img src={clip} className={`clip ${uploadedFile ? "hasfile" : ''}`} ref={clipico} onClick={()=>{setupload(true)}}/>
                        <button className={`Post${posting?"ing":""}`} onClick={makepost}>Post{posting?"ing...":""}</button>
                    </div>
                    <div className='Displaying'>
                        <h3>Currently Showing</h3>
                        <select  className="filter-drop" name='Platform' required value={platform} onChange={HandleChange}>
                            <option value="">All</option>
                            <option value='PS'>Playstation</option>
                            <option value='PC'>PC</option>
                            <option value='XB'>Xbox</option>
                            <option value='NI'>Nintendo</option>
                        </select>
                    </div>
                    {
                        activeTab==='General'?(
                            <div className='Content'>
                                <div>
                                    {GetAllPosts}
                                </div>
                            </div>
                        ):<div className='Content'>
                            <div>
                                {GetAllFollowingPosts.length>0?GetAllFollowingPosts:
                                <p className='none-yet'>There are no posts dedicated to this category😔</p>}
                            </div>
                        </div>
                    }
                </div>
            </div>
            {uploadbox ? <UploadBox clearvar={setupload} fileinf={{file:uploadedFile,upload:uploadFile}}/> : ''}
        </div>
    );
}

export default HomePage;