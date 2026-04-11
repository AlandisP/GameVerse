import React, { useState, useEffect } from 'react';
import "../PF.css";
import "../Overlay.css";
import API_URL from '../../config/api';
import axios from 'axios';
import ErrorMessage from './ErrorMessage';
import { useActionData } from 'react-router-dom';

function EditPartyOverlay({isOpen, onClose, Name, Description, Categories, Count, Members,refresh, refreshCurrent}) {
    const [genre, setGenres] = useState([]);
    const [partyfocused, setPartyFocused] = useState([]);
    const [playstyle, setPlaystyle] = useState([]);
    const [gamemodes, setGamemodes] = useState([]);
    const [social, setSocial] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const[items, setItems] = useState(Categories??[]);
    const token  = localStorage.getItem('token');
    const [partyName, setPartyName] = useState(Name);
    const [partyDescription, setDescription] = useState(Description);
    const [number, setNumber] = useState(Count);
    const [error, setError] = useState("");
    const [time, setTime] = useState('');

    const handleSelectCategory = (category) => {
        if (items.includes(category)) {
            setItems(items.filter(c => c !== category));
        } else {
            setItems([...items, category]);
        }
    };
    useEffect(() => {
        const getCategories = async () => {
            const result = await axios.get(
                `${API_URL}/parties/categories`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGenres(result.data.genre);
            setGamemodes(result.data.gameModes);
            setPlaystyle(result.data.playstyle);
            setPartyFocused(result.data.partyFocused);
            setSocial(result.data.social);
            setPlatforms(result.data.platform);
        };
        getCategories();
    }, [token]);

    const handleNameChange = (e) => {
        setPartyName(e.target.value);
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    }

    const handleNumberChange = (e) => {
        setNumber(e.target.value);
    }

    const handleTimeChange = (e) => {
        setTime(e.target.value);
    }



    const handleEdit = async() => {
        try {
            const result = await axios.post(
            `${API_URL}/parties/${Name}/editParty`,{name: partyName, description: partyDescription, maxMembers: parseInt(number), categories: items, time: parseInt(time)},
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setPartyName('');
            setDescription('');
            setNumber('');
            setItems([]);
            refreshCurrent();
            
        } catch (error) {
            console.error("Party Creating failed:", error.response?.data || error.message);
            setError({ text: error.response?.data, id: Date.now() });
        }
    };

    const genres = genre.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{transformString(category)}</p>
    ));

    const partyf = partyfocused.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{transformString(category)}</p>
    ));

    const plays = playstyle.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{transformString(category)}</p>
    ));

    const socials = social.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{transformString(category)}</p>
    ));

    const modes = gamemodes.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{transformString(category)}</p>
    ));

    const plats = platforms.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{transformString(category)}</p>
    ));




    


    return (
        <>
        {isOpen ? (
            
            <div className='overlay'>
                 <ErrorMessage Message={error}/>
                <div className='overlay-background-party'>
                    <div className='top-portion'>
                        <h1 className='header'>Edit Party</h1>
                        <button className='close' onClick={onClose}>X</button>
                    </div>
                    <div className='contents-party'>
                        <h2 className='headers'>Name</h2>
                        <input className='inputs' value={partyName} placeholder='Enter Party Name' onChange={handleNameChange}></input>
                        <h2 className='headers'>Description</h2>
                        <input className='inputs' value={partyDescription} placeholder='Enter Party Description' onChange={handleDescriptionChange}></input>
                        <h2 className='headers' type="number" placeholder='Enter Number of Members'>Number of Members</h2>
                        <input className='inputs' value={number} onChange={handleNumberChange}></input>
                         <h2 className='headers' type="number">Timer(Seconds)</h2>
                        <input type='number' className='inputs' placeholder='Enter time until party is active' onChange={handleTimeChange}></input>
                        <h2 className='headers'>Select Categories</h2>
                        <div className='modes'>
                            <p className='subs'>Genre</p>
                            <div className='select-list'>{genres}</div>
                            <p className='subs'>Play Style</p>
                            <div className='select-list'>{plays}</div>
                            <p className='subs'>Party Focused</p>
                            <div className='select-list'>{partyf}</div>
                            <p className='subs'>Game Modes</p>
                            <div className='select-list'>{modes}</div>
                            <p className='subs'>Social</p>
                            <div className='select-list'>{socials}</div>
                            <p className='subs'>Platform</p>
                            <div className='select-list'>{plats}</div>
                        </div>
                    </div>
                    <button className='create' onClick={handleEdit}>Edit</button>
                </div>

            </div>

        ):"" }

        </>

    );

}

function transformString(text) {
    const newtext = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    return newtext.replace(/_/g, " ");

}
export default EditPartyOverlay;