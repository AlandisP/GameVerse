import Heart from '../images/HeartBlank.png'
import HeartFull from '../images/HeartFull.png'
import Bookmark from '../images/Bookmark.png'
import BookmarkFull from '../images/BookmarkFull.png'
import Pfp from '../images/Profile.png'
import commentico from '../images/Comments.png'
import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PostStyle.css'
import CommentSection from './Comments'
import { shortTimeAgo } from '../utils/shortTimeAgo'
import API_URL from '../config/api'
const urlprefab = "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";
function PostObj ({User, Content, Likes, Liked, id, books, commcount, CreatedAt, CommunityName, media, type}){
        const postid = id;
        const [didLike, setdidLike]= useState(Liked);
        const [didBook, setBook]= useState(false);
        const [falseLikes, setfalseLikes]= useState(Likes);
        const [comments, setComments]= useState(0);
        const [viewComments, setView]= useState(false);
        const [posterPfp, setposterPfp] = useState("");
        const token  = localStorage.getItem('token');
        const [imgsrc, setimgsrc] = useState(urlprefab+User+"/Profile/ProfilePic");
        const navigate = useNavigate();
        useEffect(()=>{
            console.log(type);
            setBook(books);
            setComments(commcount);
        },[]);
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
            console.log(Liked);
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
        }
        return(
            <div>
            <div className='Postcontent'>
                <img className='Others' src={imgsrc} onError={()=>{setimgsrc(Pfp)}}/>
                <div className='inner'>
                    {/* <h3>@{User}</h3> */}
                    <div className='top-port'>
                        <div className='info-row'>
                            <h3 onClick={()=>{navigate(`/profile/${User}`)}}>@{User}</h3>
                            {
                                CommunityName?(
                                    <p className='comname' onClick={()=>{navigate(`/communities/${CommunityName}`)}}>in {CommunityName}</p>
                                ):""
                            }
                        </div>
                        <p>{CreatedAt?shortTimeAgo(CreatedAt):""}</p>
                    </div>
                    <p className='content-p'>{Content}</p>
                    {media!=null ? <img src={media} className='Post-Media'/> : ''}
                    <div className='Media-Bar'>
                        <img src={didLike ? HeartFull : Heart} onClick={likeinteract}/>
                        <p>{falseLikes}</p>
                        <img src={commentico} onClick={viewComs}/>
                        <p>{comments}</p>
                        <img className='Bookmark' src={didBook ? BookmarkFull : Bookmark} onClick={bookinteract}/>
                    </div>
                    {viewComments ? <CommentSection pid={postid} func={setComments}/> : ''}
                </div>
                
            </div>
            </div>
        )
    }

    export default PostObj;