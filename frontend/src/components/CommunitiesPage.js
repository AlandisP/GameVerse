import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import background from "../images/tempbackground.png"
import "./ComStyles.css";
import API_URL from '../config/api';
import axios from 'axios';
import CreateCommunityOverLay from './CommunitySubPages/CreateCommunityOverlay';
import ExploreCommunities from './CommunitySubPages/ExploreCommunities';
import UserCommunities from './CommunitySubPages/UserCommunities';

const urlprefab = "https://gameverse-media-026955879175-us-east-2-an.s3.us-east-2.amazonaws.com/";

function CommunitiesPage() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('communities');
    const [isOpen, setIsOpen] = useState(false);
    const [exploreIsOpen, setIsExploreOpen] = useState(false);
    const [myComsIsOpen, setMyComsIsOpen] = useState(false);
    const[categories, setCategories] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [userCommunities, setUserCommunities] = useState([]);
    const [allUserCommunities, setAllUserCommunities] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    const getCommunities = async() => {
        const res = await axios.get(
            `${API_URL}/communities`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setCommunities(res.data);
    };

    const handleSelectCategory = (cat) => {
        if(cat === selectedCategory) {
            setSelectedCategory("");
        } else {
            setSelectedCategory(cat);
        }
    }

    const getUserCommunities = async() => {
        try {
            const res = await axios.get(
            `${API_URL}/communities/memberships`,
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserCommunities(res.data);
        } catch (error) {
                console.error("failed to get user communities: ", error.response?.data || error.message);
        }
    }

    // For the View All button
    const getAllUserCommunities = async() => {
        try {
            const res = await axios.get(
            `${API_URL}/communities/memberships?limit=10000`,
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllUserCommunities(res.data);
        } catch (error) {
            console.error("failed to get all user communities: ", error.response?.data || error.message);
        }
    }

    

    useEffect(() => {
        const getCategories = async () => {
            const result = await axios.get(
                `${API_URL}/communities/categories`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(result.data);
        };
        
        getUserCommunities();
        getCategories();
        getCommunities();
    }, [token]);

    const cats = categories.map((cat,index) =>(
        <button key={index} onClick={() => handleSelectCategory(cat)} className={!(cat===selectedCategory)?"catbutton":"buttonSelected"}>{cat}</button>));



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

    const handleMyCommunities = () => {
        setMyComsIsOpen(!myComsIsOpen);
        getAllUserCommunities();
    }

    const handleCloseMyComs = () => {
        setMyComsIsOpen(false);
    }

    const ReadFeaturedCommunities = () => {
        const filtered = (selectedCategory? communities.filter(c=>c.communityCategory === selectedCategory):communities );
        const top3 = [...filtered].sort((a,b) => b.memberCount - a.memberCount).slice(0,3);
        const items = top3.map((community) =>(
            <FeaturedBlock key={community.id} Name={community.name} Description={community.description} MemberCount={community.memberCount} />
        ))
        return <div className='communities-box'>{items}</div>
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
                <UserCommunities isOpen={myComsIsOpen} onClose={handleCloseMyComs} communities={allUserCommunities} Refresh={getUserCommunities}/>
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
                        {cats}
                    </div>
                </div>
                <ReadFeaturedCommunities/>
                <div className='mycommunities'>
                    <div className='mycom-top'>
                        <h2>My Communities</h2>
                        <button className='viewAll' onClick={handleMyCommunities}>View All</button>
                    </div>
                    <div className='minicoms'>
                        {userCommunities.map((community) => (
                            <div className='minicombox' key={community.id} onClick={() => navigate(`/communities/${community.name}`)}>
                                <div className='placeholderbox'></div>
                                <div className='minicol'>
                                    <h3>{community.name}</h3>
                                    <p>{community.memberCount} members</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

function FeaturedBlock({Name, Description, MemberCount}) {
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [memberCount, setMemberCount] = useState(MemberCount);
    const isMember = members?.some(member => member.id === userId);
    const [joined, setJoined] = useState(isMember);
    const [imgsrc, setimgsrc] = useState(urlprefab+Name+"/Profile/Banner");

    const handleJoinClick = async(e) => {
        try {
            e.stopPropagation();
            const res = await axios.put(
                `${API_URL}/communities/${Name}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMemberCount(prev => prev + 1);
            setJoined(true);
        } catch (error) {
            console.error("failed to join community: ", error.response?.data || error.message);
        }
    }

    useEffect(() => {
        const GetMembers = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/communities/${Name}/AllMembers`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMembers(res.data);
                const alreadyMember = res.data.some(member => member.id === userId);
                setJoined(alreadyMember);
            } catch (error) {
                console.error("Couldn't fetch the members")
            }
        }
        GetMembers();
        
    }, [token])

    return (
        <div className='fcommunity' onClick={() => navigate(`/communities/${Name}`)}>
            <div className='imgbox'>
                {imgsrc!=="" ?
                <img src={imgsrc} style={{
                width:"100%",
                height:"100%",
                objectFit: "fill"
                }} onError={()=>{setimgsrc("")}}/>
                : "" }
            </div>
            <div className='topbox-txt'>
                <h3>{Name}</h3>
                <p className='count'>{memberCount}</p>
            </div>
            <p className='description'>{Description}</p>
            {
                !joined?(
                    <button className='joinbtnf' onClick={handleJoinClick}>Join</button>
                ):<button className='joinedbtnf'>Joined</button>
            }
        </div>
    )
}

export default CommunitiesPage;
