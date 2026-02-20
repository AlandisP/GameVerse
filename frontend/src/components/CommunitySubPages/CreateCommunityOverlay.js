import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import axios from 'axios';

function CreateCommunityOverlay({isOpen, onClose, onCommunityCreated}) {
    const token  = localStorage.getItem('token');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [communityName, setCommunityName] = useState("");
    const [comDescription, setComDescription] = useState("");
    const [categories, setCategories] = useState([]);


    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    }

    const handleNameChange = (e) => {
        setCommunityName(e.target.value);
    }

    const handleDescriptionChange = (e) => {
        setComDescription(e.target.value);
        e.target.style.height = "auto";               // reset
        e.target.style.height = `${e.target.scrollHeight}px`; // grow to fit

    }

    const handleCreate = async() => {
        const result = await axios.post (
            `${API_URL}/communities/createCommunity`, {name: communityName, description: comDescription, category: selectedCategory},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setSelectedCategory(null);
        setComDescription("");
        setCommunityName("");
        onCommunityCreated();
    }

    useEffect(() => {
        const getCategories = async () => {
            const result = await axios.get(
                `${API_URL}/communities/categories`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(result.data);
        };
        getCategories();
    }, [token]);



    const cats = categories.map((category, index) => (
        <p className={selectedCategory === category ?'catbox2-selected' : 'catbox2'} key={index} onClick={() => handleSelectCategory(category)}>{category}</p>
    ));

    return (
        <>
        {isOpen?(
            <div className='overlay'>
                <div className='overlay-background2'>
                    <div className='top-portion'>
                        <h1>Create Community</h1>
                        <button className='close' onClick={onClose}>X</button>
                    </div>
                    <div className='comcontent'>
                        <h2 className='headers'>Community Name</h2>
                        <input  className = 'inputs' placeholder='Enter the Community Name' onChange={handleNameChange}></input>
                        <h2 className='headers'>Community Description</h2>
                        <textarea  maxLength="225" rows='1' cols="50" className = 'inputs2' placeholder='Whats the goal of your Community?' onChange={handleDescriptionChange}></textarea>
                        <h2 className='headers'>Community Category</h2>
                        <div className='select-list'>
                                {cats}
                        </div>
                    </div>
                    <button className='create' onClick={handleCreate}>Create</button>
                </div>
            </div>
        ):""}
        </>

    );
}
export default CreateCommunityOverlay;