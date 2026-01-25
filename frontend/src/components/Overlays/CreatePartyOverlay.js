import React, { useState, useEffect } from 'react';
import "../PF.css";
import "../Overlay.css";
import API_URL from '../../config/api';
import axios from 'axios';


function CreatePartyOverlay({isOpen, onClose, onPartyCreated}) {
    const [categories, setCategories] = useState([]);
    const[items, setItems] = useState([]);
    const token  = localStorage.getItem('token');
    const [partyName, setPartyName] = useState("");
    const [partyDescription, setDescription] = useState("");
    const [number, setNumber] = useState('');

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
            setCategories(result.data);
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


    const handleCreate = async() => {
        const result = await axios.post(
            `${API_URL}/parties/createParty`,{name: partyName, description: partyDescription, maxMembers: parseInt(number), categories: items },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setPartyName('');
        setDescription('');
        setNumber('');
        setItems([]);
        onPartyCreated();
    };

    

    const cats = categories.map((category,index) =>(
        <p className={items.includes(category)? 'catbox2-selected' : 'catbox2' } key={index} onClick={() => handleSelectCategory(category)}>{category}</p>));


    return (
        <>
        {isOpen ? (
            <div className='overlay'>
                <div className='overlay-background'>
                    <div className='top-portion'>
                        <h1 className='header'>Create Party</h1>
                        <button className='close' onClick={onClose}>X</button>
                    </div>
                    <div className='contents'>
                        <h2 className='headers'>Party Name</h2>
                        <input className='inputs' placeholder='Enter Party Name' onChange={handleNameChange}></input>
                        <h2 className='headers'>Description</h2>
                        <input className='inputs' placeholder='Enter Party Description' onChange={handleDescriptionChange}></input>
                        <h2 className='headers' type="number">Number of Members</h2>
                        <input className='inputs' placeholder='Enter Number of Members' onChange={handleNumberChange}></input>
                        <h2 className='catHeader'>Select Categories</h2>
                        <div className='select-list'>
                            {cats}
                        </div>
                    </div>
                    <button className='create' onClick={handleCreate}>Create</button>
                </div>

            </div>

        ):"" }

        </>

    );

}
export default CreatePartyOverlay;