import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './upload.css'
import upload from '../images/Upload.png'

function UploadBox(){
    const [file, setfile] = useState(null);
    const [fileurl, setfurl] = useState(null);
    useEffect(()=>{
        if(!file){
            setfurl(null);
            if(fileurl){
                URL.revokeObjectURL(fileurl);
                setfurl(null);
            }
            return;
        }
        URL.revokeObjectURL(fileurl);
        const theurl = URL.createObjectURL(file);
        setfurl(theurl);
        return() => {
            URL.revokeObjectURL(fileurl);
        };
    },[file]);
    const onupload = (e) => {
        const upload = e.target.files;
        if(upload && upload.length > 0){
            setfile(upload[0]);
        }
    }
    const ondrag = (e) => {
        e.preventDefault();
        const upload = e.dataTransfer.files;
        if(upload && upload.length > 0){
            setfile(upload[0]);
        }
    }
    const DispFile = ()=>{
        return(
        <div className='FileInf'>
            <h3>{file.name}</h3>
            <img src={fileurl}/>
            <div className='options'>
                
            </div>
        </div>
        )
    }
    return(
        <div className='Upload-Container'>
            <div className='Upload-Box' onDrop={ondrag} onDragOver={(event)=> event.preventDefault()}>
                <p className='Close'>X</p>
                <h1>Upload Content</h1>
                {file ? <DispFile/> :
                <label htmlFor='upload'>
                    <div className='box'>
                        <img src={upload}/>
                        <input id='upload' type='file' onChange={onupload}/>
                    </div>
                </label>
                }
            </div>
        </div>
    )
}
export default UploadBox;