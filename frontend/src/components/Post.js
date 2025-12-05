import Heart from '../images/HeartBlank.png'
import HeartFull from '../images/HeartFull.png'
import Pfp from '../images/Profile.png'
import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
function PostObj ({User, Content, Likes, Liked, id}){
        const postid = id;
        const [didLike, setdidLike]= useState(Liked);
        const [falseLikes, setfalseLikes]= useState(Likes);
        const token  = localStorage.getItem('token');
        const navigate = useNavigate();
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
                    </div>
                </div>
            </div>
        )
    }

    export default PostObj;