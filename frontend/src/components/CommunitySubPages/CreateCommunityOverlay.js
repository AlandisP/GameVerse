import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import axios from 'axios';

function CreateCommunityOverlay({isOpen, onClose, onCommunityCreated}) {
    const token  = localStorage.getItem('token');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [communityName, setCommunityName] = useState("");
    const [comDescription, setComDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");

    const ClearFields = () => {
        setError("");
        setSelectedCategory(null);
        setComDescription("");
        setCommunityName("");
    }


    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    }

    const handleNameChange = (e) => {
        setCommunityName(e.target.value);
    }

    const handleDescriptionChange = (e) => {
        setComDescription(e.target.value);
    }

    const handleCreate = async() => {
        if(selectedCategory=== null) {
            setError("You must select a category.");
            return;
        } else if(communityName.trim().length === 0) {
            setError("You must have a name for your community.");
            return;
        } else if(comDescription.trim().length === 0) {
            setError("You must have a description for your community.");
            return;
        }
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
                <div className='overlay-background-party'>
                    <div className='top-portion'>
                        <h1>Create Community</h1>
                        <button className='close' onClick={() => {onClose(); ClearFields();} }>X</button>
                    </div>
                    <div className='comcontent'>
                        <h2 className='headers'>Community Name</h2>
                        <input  className = 'inputs' placeholder='Enter the Community Name' onChange={handleNameChange} maxLength="80"></input>
                        <h2 className='headers'>Community Description</h2>
                        <textarea  maxLength="225" rows='1' cols="50" className = 'inputs2' placeholder='Whats the goal of your Community?' onChange={handleDescriptionChange}></textarea>
                        <h2 className='headers'>Community Category</h2>
                        <div className='select-list'>
                                {cats}
                        </div>
                        <p className='error-txt'>{error}</p>
                    </div>
                    <button className='create' onClick={handleCreate}>Create</button>
                </div>
            </div>
        ):""}
        </>

    );
}
export default CreateCommunityOverlay;