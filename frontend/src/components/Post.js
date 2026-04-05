import Heart from '../images/HeartBlank.png'
import HeartFull from '../images/HeartFull.png'
import Bookmark from '../images/Bookmark.png'
import BookmarkFull from '../images/BookmarkFull.png'
import Pfp from '../images/Profile.png'
import commentico from '../images/Comments.png'
import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
// import './PostStyle.css'
import './NewPostStyle.css'
import CommentSection from './Comments'
import dots from "./../images/dots.png";
import { shortTimeAgo } from '../utils/shortTimeAgo'
import API_URL from '../config/api'
const urlprefab = "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";
function PostObj ({User, Content, Likes, Liked, id, books, commcount, CreatedAt, CommunityName, media, type, popup}){
        const postid = id;
        const username = localStorage.getItem('username');
        const [didLike, setdidLike]= useState(Liked);
        const [didBook, setBook]= useState(false);
        const [falseLikes, setfalseLikes]= useState(Likes);
        const [comments, setComments]= useState(0);
        const [viewComments, setView]= useState(false);
        const [posterPfp, setposterPfp] = useState("");
        const token  = localStorage.getItem('token');
        const [imgsrc, setimgsrc] = useState(urlprefab+User+"/Profile/ProfilePic");
        const [pop, setpop] = useState(false);
        const dotsbar = useRef();
        const navigate = useNavigate();
        const [deleted,deleter] = useState(false);
        useEffect(()=>{
            setBook(books);
            setComments(commcount);
        },[]);

        const ParsedText = ({text})=>{
            const mention = /(@[a-zA-Z0-9]+)/g;
            const segments = text.split(mention);
            //console.log(segments);
            return(<p className={`written-content` + `${CommunityName?"":" shiftup"}`}>
                {segments.map((seg, index)=>{
                    if(seg.match(mention)){
                    return(<h4 key={index} className='at' onClick={()=>{navigate(`/profile/${seg.substring(1)}`)}}>{seg}</h4>);
                    }
                    return <React.Fragment key={index}>{seg}</React.Fragment>
                })}
            </p>);
        }
        const likeinteract = async ()=>{
            await axios.post(
                `${API_URL}/post/likepost`,{id:id},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if(didLike){
                setfalseLikes(falseLikes-1);
            }else{
                setfalseLikes(falseLikes+1);
            }
            setdidLike(!didLike);
            //console.log(Liked);
        }
        const bookinteract = async ()=>{
            await axios.post(
                `${API_URL}/post/bookpost`,{id:id},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBook(!didBook);
        }
        const viewComs = ()=>{
            setView(!viewComments);
            if(popup)
                popup.func("");
        }

        const deletePost = async()=>{
            console.log(media);
            await axios.post(
                `${API_URL}/post/deletepost`,{id},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            deleter(true);
        }

        const blockUser = async() => {
            try {
                const res = await axios.post (
                `${API_URL}/profile/block/${User}`,
                {}, { headers: { Authorization: `Bearer ${token}` } }
                );
                window.location.reload();
            } catch (error) {
                console.error("failed to Block user: ", error.response?.data || error.message);
            }
        }
        useEffect(()=>{
            if(!pop)
                return;
            const clickevent = (e)=>{
                const target = e.target;
                if(!target.closest(".Popup")){
                    setpop(false);
                }
            }
            document.addEventListener("click", clickevent,true);
            return()=>{
                document.removeEventListener("click", clickevent);
            }
        },[pop]);
        const PopUp = ({item})=>{
            return(
                <div className='Popup' style={{left:`${item.current.offsetLeft-70}px`,top:`${item.current.offsetTop+20}px`}}>
                    <button onClick={bookinteract}>{didBook?"Bookmarked":"Bookmark"}</button>
                    {username!=User?
                    <button onClick={blockUser}>Block</button> :
                    <button onClick={deletePost}>Delete</button>
                    }   
                </div>
            );
        }
        return(
            <div>
            {!deleted?
            <div className='New-Post'>
            <div className='top-bar'>
                <img className='PFP' src={imgsrc} onError={()=>{setimgsrc(Pfp)}}/>
                <div className='Info'>
                    <div className='top-bar'>
                        <h3 onClick={()=>{navigate(`/profile/${User}`)}}>@{User}</h3>
                        <p>•</p>
                        <p>{CreatedAt?shortTimeAgo(CreatedAt):""}</p>
                        <img className='popup' src={dots} ref={dotsbar} onClick={()=>{setpop(true)}}/>
                        {pop?<PopUp item={dotsbar}/>:""}
                    </div>
                    {CommunityName?(
                        <p className='Community-Tag' onClick={()=>{navigate(`/communities/${CommunityName}`)}}>in {CommunityName}</p>
                    ):""}
                </div>
            </div>
            <ParsedText className='written-content' text={Content}/>
            <div className='media'>
                {media!=null && /image/g.test(type) ? <img src={media} className='Post-Media'/> : ''}
                {media!=null && /video/g.test(type) ? <video className='Post-Media' controls><source src={media}/></video> : ''}
            </div>
            <div className='interaction-bar'>
                <img src={didLike ? HeartFull : Heart} onClick={likeinteract}/>
                <p>{falseLikes}</p>
                <img src={commentico} onClick={viewComs}/>
                <p>{comments}</p>
            </div>
            {viewComments ? <CommentSection pid={postid} func={setComments}/> : ''}
            </div>
            :""}
            </div>
        )
    }

    export default PostObj;