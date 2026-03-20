import React, { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import './PostStyle.css'
import Pfp from '../images/Profile.png'
import Add from '../images/AddButton.png'
import msg from '../images/Message.png'
import API_URL from '../config/api';

function Comment({User, body}){
    const token  = localStorage.getItem('token');
    return(
        <div className='comment'>
            <img src={Pfp}/>
            <p>{User}: </p>
            <p>{body}</p>
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
function CommentSection({pid,func}){
    const token  = localStorage.getItem('token');
    const [msgenabled, setmsg] = useState(false);
    const [commentlist, setcoms] = useState([]);
    const [updatecomments, setupdate] = useState(false);
    const Comms = ()=>{
        const items = commentlist.map((thecom,index)=>{
            return(<Comment key={index} User={thecom.poster} body={thecom.content}/>)
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
            <div className='Comment-Section'>
                <div className='com-bar'>
                    <h4>Comments</h4>
                    {/* <img src={Add}/> */}
                    <button onClick={()=>{setmsg(true);getcomms();}}><p>Add</p></button>
                </div>
                {msgenabled ? <Messagebar poid={pid} func={getcomms} commmnmum={func} size={commentlist.length}/> : '' }
                <Comms/>
            </div>
        </div>
    )
}

export default CommentSection;