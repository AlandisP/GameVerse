import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import background from "../images/tempbackground.png"
import "./ComStyles.css";
import API_URL from '../config/api';
import axios from 'axios';
import CreateCommunityOverLay from './CommunitySubPages/CreateCommunityOverlay';
import ExploreCommunities from './CommunitySubPages/ExploreCommunities';


function CommunitiesPage() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('communities');
    const [isOpen, setIsOpen] = useState(false);
    const [exploreIsOpen, setIsExploreOpen] = useState(false);
    const[categories, setCategories] = useState([]);
    const [communities, setCommunities] = useState([]);

    const getCommunities = async() => {
        const res = await axios.get(
            `${API_URL}/communities`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setCommunities(res.data);
    };

    

    useEffect(() => {
        const getCategories = async () => {
            const result = await axios.get(
                `${API_URL}/communities/categories`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(result.data);
        };
        getCategories();
        getCommunities();
    }, [token]);

     const cats = categories.map((category,index) =>(
        <button key={index}>{category}</button>));

    const handleCreateCommunity = () => {
        setIsOpen(!isOpen);
        getCommunities();
    }

    const handleCloseCommunity = () => {
        setIsOpen(false);
    }

    const handleExploreCommunities = () => {
        setIsExploreOpen(!exploreIsOpen);
    }

    const handleCloseExplore = () => {
        setIsExploreOpen(false);
    }

    

    return(
        <div className="page-container">
            <NavBar/>
            <div className="main-content">
                <div style={{ top:0,zIndex:10,borderBottom: "1px solid #000000ff", paddingBottom: "10px",marginLeft: "-20px", paddingLeft: "20px", position:"fixed", left:"250px", right:"0" }}>
                    <h1 style={{ color: "white", textAlign: "left",marginTop: "11px",marginLeft: "20px",marginBottom: "0"}}>Communities</h1>
                </div>
                 <div style={{ height: "60px" }}></div>
                <div>
                </div>
                <CreateCommunityOverLay isOpen={isOpen} onClose={handleCloseCommunity} onCommunityCreated={handleCreateCommunity}/>
                <ExploreCommunities isOpen={exploreIsOpen} onClose={handleCloseExplore} communities={communities}/>
                <div className='comm-top'>
                    <p className='join-txt'>Join the Ultimate Gaming Communities</p>
                    <p className='explain-txt'>Connect with fellow gamers, share experiences, and participate in exclusive events within your favorite communities.</p>
                    <div className='buttons'>
                        <button className='explorebtn' onClick={handleExploreCommunities}>Explore Communities</button>
                        <button className='crtownbtn' onClick={handleCreateCommunity}>Create Your Own</button>
                    </div>
                </div>
                <div className='featured-com'>
                    <h2>Featured Communities</h2>
                    <div className='featuredbts'>
                        <button>ALL</button>
                        {cats}
                    </div>
                </div>
                <div className='communities-box'>
                    <div className='fcommunity'>
                        <div className='imgbox'>
                            <img src={background} alt='tempimg'></img>
                        </div>
                        <div className='topbox-txt'>
                            <h3>Community Name</h3>
                            <p className='count'>100</p>
                        </div>
                        <p className='description'>The ancient oak tree whispered secrets to the wind while the quiet, silver river flowed underneath, and in that moment, time seemed to stop, allowing the world to catch its breath, forgetting all its worries and finding a deep, lasting peace in the silence </p>
                        <button className='joinbtnf'>Join</button>
                    </div>
                </div>
                <div className='mycommunities'>
                    <h2>My Communities</h2>
                    <div className='minicoms'>
                        <div className='minicombox'>
                            <div className='placeholderbox'></div>
                            <div className='minicol'>
                                <h3>Community Name</h3>
                                <p>100 members</p>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default CommunitiesPage;
