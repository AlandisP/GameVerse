import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './upload.css'
import upload from '../images/Upload.png'

function UploadBox({clearvar, fileinf}){
    const [file, setfile] = useState(null);
    const [fileurl, setfurl] = useState(null);
    const [filetype, settype] = useState("");
    const [errorf, seterror] = useState("");
    useEffect(()=>{
        if(fileinf.file){
            setfile(fileinf.file);
            if(/video/g.test(fileinf.file.type)){
                settype("video");
            }
            else if(/image/g.test(fileinf.file.type)){
                settype("image");
            }
        }
    },[]);
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
        console.log(/video/g.test(upload[0].type));
        if(/video/g.test(upload[0].type)){
            settype("video");
        }
        else if(/image/g.test(upload[0].type)){
            settype("image");
        }
        if(/video/g.test(upload[0].type)==/image/g.test(upload[0].type)){
            seterror("Invalid Media Upload");
            return;
        }
        if(upload && upload.length > 0){
            setfile(upload[0]);
            seterror("");
        }
    }
    const ondrag = (e) => {
        e.preventDefault();
        const upload = e.dataTransfer.files;
        if(/video/g.test(upload[0].type)){
            settype("video");
        }
        else if(/image/g.test(upload[0].type)){
            settype("image");
        }
        if(/video/g.test(upload[0].type)==/image/g.test(upload[0].type)){
            seterror("Invalid Media Upload");
            return;
        }
        if(upload && upload.length > 0){
            setfile(upload[0]);
        }
    }
    const clearfile = ()=>{
        URL.revokeObjectURL(fileurl);
        setfurl(null);
        setfile(null);
        if(fileinf)
        fileinf.upload(null);
    }
    const uploadfile = ()=>{
        if(fileinf)
        fileinf.upload(file);
        close();
    }
    const close =()=>{
        //clearfile();
        if(clearvar){
            clearvar(false);
        }
    }
    const DispFile = ()=>{
        return(
        <div className='FileInf'>
            <h3>{file.name}</h3>
            <div>
                {filetype=="video"?<video><source src={fileurl}/></video>:""}
                {filetype=="image"?<img src={fileurl}/>:""}
                
            </div>
            <button className='clr' onClick={clearfile}>Clear</button>
            <button className='upl' onClick={uploadfile}>Upload</button>
        </div>
        )
    }
    return(
        <div className='Upload-Container'>
            <div className='Upload-Box' onDrop={ondrag} onDragOver={(event)=> event.preventDefault()}>
                <button className='Close' onClick={close}>X</button>
                <h1>Upload Content</h1>
                {file ? <DispFile/> :
                <label htmlFor='upload'>
                    <div className='box'>
                        <p>Drag or Select Media Here</p>
                        <img src={upload}/>
                        <input id='upload' type='file' onChange={onupload}/>
                    </div>
                </label>
                }
                {errorf!="" ? <p className='Error-Msg'>{errorf}</p>:""}
            </div>
        </div>
    )
}
export default UploadBox;