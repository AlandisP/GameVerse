import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import CreatePartyOverlay from './Overlays/CreatePartyOverlay';
import "./PF.css";
import logo from '../images/search.png';
import plus from '../images/plus.png';
import API_URL from '../config/api';
import axios from 'axios';
import Party from '../components/Party';
import { shortTimeAgo } from '../utils/shortTimeAgo'

function PartyFinderPage() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('partyfinder');
    const [search, setSearch] = useState("");
    const [parties, setParties] = useState([]);
    const [currParty, setCurrentParty] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    

    const handleCreateParty = () => {
        //alert("Hey this works");
        setIsOpen(!isOpen);
    }


    const handleCloseParty = () => {
        setIsOpen(false);
    }

    const getParties = async() => {
        const result = await axios.get(
            `${API_URL}/parties`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        setParties(result.data);
    };

    const searchParties = async(q) => {
        if(!q || q.trim() === "") {
            getParties();
            return;
        }
        try {
            const res = await axios.get(
                `${API_URL}/parties/matches`, {
                    params: {text:q},
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setParties(res.data);
        } catch(error) {
            console.error("Search failed:", error.response?.data || error.message);
        }
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            searchParties(search);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);


    const ReadParties = () => {
        const filtered = currParty ? parties.filter(p => p.id !== currParty.id):parties;
        const items = filtered.map((party, ind) => (
            <Party key={ind} Name={party.name} Description={party.description} Categories={party.categories} Count={party.maxMembers} Members={party.members} Status={party.status} CreatorId={party.creatorId} id={party.id} refresh={getParties} refreshCurrent={GetCurrentParty} Time={shortTimeAgo(party.createdAt)}/>
        ));
        return(
            <div>{items}</div>
        )
    }

    const GetCurrentParty = async() => {
        try {
            const res = await axios.get(
                 `${API_URL}/parties/myParty`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCurrentParty(res.data);
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setCurrentParty(null);
                return;
            }
        }
    }

    const handlePartyCreated = () => {
        getParties();
        GetCurrentParty();
        setIsOpen(false);
    }

    const ReadCurrentParty = () => {
        if(!currParty) {
            return <p className='noParty'>You are currently not in a party</p>
        }
        return (
            <div>
                <Party 
                    Name={currParty.name} 
                    Description={currParty.description} 
                    Categories={currParty.categories} 
                    Count={currParty.maxMembers} 
                    Members={currParty.members} 
                    Status={currParty.status}
                    CreatorId={currParty.creatorId}
                    id={currParty.id}
                    refresh={getParties}
                    refreshCurrent={GetCurrentParty}
                    Time={shortTimeAgo(currParty.createdAt)}/>
            </div>
        );
    }
    useEffect(() => {
        getParties();
        GetCurrentParty();
    }, [token]);

    return(
        <div className="page-container">
            <NavBar/>
            <CreatePartyOverlay isOpen={isOpen} onClose={handleCloseParty} onPartyCreated={handlePartyCreated}/>

            <div className="main-content">

                 <div style={{ 
        borderBottom: "1px solid #000000ff", 
        paddingBottom: "10px",
        marginLeft: "-20px", 
        paddingLeft: "20px" 
    }}>
        <h1 style={{ 
            color: "white", 
            textAlign: "left",
            marginTop: "50px",
            marginLeft: "20px",
            marginBottom: "0"
        }}>
            Party Finder
        </h1>
    </div>
    <div className='top-container'>
        <div className = "search-bar">
            <img src={logo} alt="search" className='search-img'></img>
            <input
                className="bar"
                type = "text"
                placeholder='Enter the name of Party!'
                onChange={(c) => setSearch(c.target.value)}
            />
        </div>
        <div className="createButton">
            <button className='create-button' onClick={handleCreateParty}>
                Create Party
            </button>
            <img src={plus} alt="pluslogo" className='plus-img'/>
        </div>

        </div>
        <h2>Current Party</h2>
        <ReadCurrentParty/>
        <h2>Available Parties</h2>
        <ReadParties/>
    </div>
             
            </div>
    );
}

export default PartyFinderPage;