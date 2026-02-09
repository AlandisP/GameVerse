import Heart from '../images/HeartBlank.png'
import HeartFull from '../images/HeartFull.png'
import Bookmark from '../images/Bookmark.png'
import BookmarkFull from '../images/BookmarkFull.png'
import Pfp from '../images/Profile.png'
import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PostStyle.css'
function PostObj ({User, Content, Likes, Liked, id, books}){
        const postid = id;
        const [didLike, setdidLike]= useState(Liked);
        const [didBook, setBook]= useState(false);
        const [falseLikes, setfalseLikes]= useState(Likes);
        const token  = localStorage.getItem('token');
        const navigate = useNavigate();
        useEffect(()=>{
            setBook(books);
        },[]);
        const likeinteract = async ()=>{
            await axios.post(
                'http://localhost:8080/post/likepost',{id:id},
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
                'http://localhost:8080/post/bookpost',{id:id},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBook(!didBook);
        }
        return(
            <div className='Postcontent'>
                <img className='Others' src={Pfp}/>
                <div className='inner'>
                    {/* <h3>@{User}</h3> */}
                    <h3 onClick={()=>{navigate(`/profile/${User}`)}}>@{User}</h3>
                    <p>{Content}</p>
                    <div className='Media-Bar'>
                        <img src={didLike ? HeartFull : Heart} onClick={likeinteract}/>
                        <p>{falseLikes}</p>
                        <img className='Bookmark' src={didBook ? BookmarkFull : Bookmark} onClick={bookinteract}/>
                    </div>
                </div>
            </div>
        )
    }

    export default PostObj;