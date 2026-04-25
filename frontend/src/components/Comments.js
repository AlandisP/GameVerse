import React, { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import './NewPostStyle.css'
import Pfp from '../images/Profile.png'
import Add from '../images/AddButton.png'
import msg from '../images/Message.png'
import API_URL from '../config/api';
import dots from "./../images/dots.png";

const urlprefab = "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";

function Comment({User, body, postdat, poster, refresh, num, size}){
    const token  = localStorage.getItem('token');
    const [imgsrc, setimgsrc] = useState(urlprefab+User+"/Profile/ProfilePic");
    const [pop, setpop] = useState(false);
    const dotsbar = useRef();
    const username = localStorage.getItem('username');
    useEffect(()=>{
        if(!pop)
            return;
        const clickevent = (e)=>{
            const target = e.target;
            if(!target.closest(".Comment-Popup")){
                setpop(false);
            }
        }
        document.addEventListener("click", clickevent,true);
        return()=>{
            document.removeEventListener("click", clickevent);
        }
    },[pop]);
    const delcom = async () =>{
        const pid = await axios.post(
            `${API_URL}/post/deletecomment`,{content:body,id:postdat,user:User},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        refresh();
        num(size-1);
        
    }
    const PopUp = ({item})=>{
            return(
                <div className='Comment-Popup' style={{left:`${item.current.offsetLeft+25}px`,top:`${item.current.offsetTop-15}px`}}>
                    <button onClick={delcom}>Delete</button>
                </div>
            );
        }
    return(
        <div className='comment'>
            <img src={imgsrc} style={{borderRadius:"50%"}} onError={()=>{setimgsrc(Pfp)}}/>
            <p>{User}: </p>
            <p>{body}</p>
            {User==username||username==poster?<img className='comment-popup' src={dots} ref={dotsbar} onClick={()=>{setpop(true)}}/>:""}
            {pop?<PopUp item={dotsbar}/>:""}
        </div>
    )
}
function Messagebar({poid,func,commmnmum, size}){
    const token  = localStorage.getItem('token');
    const addcomment = async () => {
        const pid = await axios.post(
            `${API_URL}/post/comment`,{content:postbod,id:poid},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        func();
        commmnmum(size+1);
    }
    const autoresize = (e) =>{
        text.current.style.height = "fit-content";
        text.current.style.height = `${text.current.scrollHeight-20}px`;
        setpostbod(e.target.value);
    }
    const text = useRef(null);
    const [postbod, setpostbod] = useState("");
    return(
        <div className='Message-Bar'>
            <textarea rows='1' cols='50' maxLength='150' ref={text} onChange={autoresize} placeholder='Add a comment to the post'></textarea>
            <img src={msg} onClick={addcomment}/>
        </div>
    )
}
function CommentSection({pid,func,poster}){
    const token  = localStorage.getItem('token');
    const [msgenabled, setmsg] = useState(true);
    const [commentlist, setcoms] = useState([]);
    const [updatecomments, setupdate] = useState(false);
    const Comms = ()=>{
        const items = commentlist.map((thecom,index)=>{
            return(<Comment key={index} User={thecom.poster} body={thecom.content} postdat={pid} poster={poster} refresh={getcomms} num={func} size={commentlist.length}/>)
        });
        return(
            <div className='Comment-Container'>
                {items}
                {/* <Comment User="User" body='I REALLY HATE THAT NAVBAR'/> */}
            </div>
        )
    }
    const getcomms = async ()=>{
        const result = await axios.post(
                `${API_URL}/post/getcomments`,{id:pid},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        setcoms(result.data.toReversed());
        //console.log(result.data);
    }
    useEffect(()=>{
        getcomms();
    },[0]);
    return(
        <div className='div-bar'>
            <div className='Comment-Sec'>
                <div className='com-bar'>
                    <h4>Comments</h4>
                    {/* <img src={Add}/> */}
                </div>
                {msgenabled ? <Messagebar poid={pid} func={getcomms} commmnmum={func} size={commentlist.length}/> : '' }
                <Comms/>
            </div>
        </div>
    )
}

export default CommentSection;