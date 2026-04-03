import React, { useState, useEffect, useSyncExternalStore } from 'react';
import "./ExploreCommunities.css";
import backbtn from "../../images/u-turn-arrow.png"
import logo from "../../images/search.png"
import API_URL from '../../config/api';
import axios from 'axios';
import CommunityBlock from './CommunityBlock';

function ExploreCommunities({isOpen, onClose, communities, Refresh}) {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const[categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(communities);
    
    const handleSelectCategory = (cat) => {
        if(cat === category) {
            setCategory("");
        } else {
            setCategory(cat);
        }
    }

    useEffect(() => {
        if(isOpen) {
            setFiltered(communities);
        }
    }, [communities, isOpen]);


    const searchCommunities = async(q) => {
        if(!q || q.trim() === "") {
            setFiltered(communities);
            return;
        }
        setFiltered(communities.filter(c => 
            c.name.toLowerCase().includes(q.toLowerCase())
        ));
    }

    const ReadCommunities = () => {
        const items = (category ? filtered.filter(c => c.communityCategory === category) : filtered).map((community, ind) => (
            <CommunityBlock key={ind} Name={community.name} Description={community.description} Category={community.communityCategory} Members={community.memberCount} OwnerId={community.ownerId} id={community.id} PFP={community.pfp}/>
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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            searchCommunities(search);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search]); 


    const cats = categories.map((cat,index) =>(
        <button key={index} onClick={() => handleSelectCategory(cat)} className={!(cat===category)?"catbutton":"buttonSelected"}>{cat}</button>));


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
                                    onChange={(c) => setSearch(c.target.value)}
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