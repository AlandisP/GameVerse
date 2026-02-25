import React, { useState, useEffect, useSyncExternalStore } from 'react';
import "./ExploreCommunities.css";
import backbtn from "../../images/u-turn-arrow.png"
import logo from "../../images/search.png"
import API_URL from '../../config/api';
import axios from 'axios';
import CommunityBlock from './CommunityBlock';

function ExploreCommunities({isOpen, onClose, communities}) {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const[categories, setCategories] = useState([]);

    const ReadCommunities = () => {
        const items = communities.map((community, ind) => (
            <CommunityBlock key={ind} Name={community.name} Description={community.description} Category={community.communityCategory} Members={community.memberCount} OwnerId={community.ownerId} id={community.id}/>
        ));
        return(
            <div>{items}</div>
        )
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

    const cats = categories.map((category,index) =>(
        <button key={index}>{category}</button>));


    return(
        <>
            {isOpen?(
                <div className='exploreMain'>
                    <div className='header'>
                        <h2 className='headertxt'>Explore Communities</h2>
                        <img src= {backbtn} className="backimg" onClick={onClose}/>
                    </div>
                    <div className='search-container'>
                        <div className='search'>
                            <img src={logo} alt="search" className='search-img'></img>
                                <input
                                    className="bar"
                                    type = "text"
                                    placeholder='Search Communities'
                                />
                        </div>
                    </div>
                    <div className='categories'>
                        <h1 className='headertxt'>Categories</h1>
                        <div className='rowbox'>
                            {cats}
                        </div>
                    </div>
                    <div className='allComs'>
                        <h1 className='headertxt'>Communities</h1>
                        <div className='allContainer'>
                            <ReadCommunities/>

                        </div>

                    </div>
                    
                </div>
            ):""}
        </>

    );
}

export default ExploreCommunities;