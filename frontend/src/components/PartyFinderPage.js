import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import "./PF.css";
import logo from '../images/search.png';
import plus from '../images/plus.png';
import sword from '../images/sword.png';
import API_URL from '../config/api';
import axios from 'axios';
import Party from '../components/Party';

function PartyFinderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const username = localStorage.getItem('username');
    const token  = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('partyfinder');
    const [search, setSearch] = useState("");
    const [parties, setParties] = useState([]);

    const handleNavClick = (e, path, tabId) => {
        e.preventDefault();
        setActiveTab(tabId);
        navigate(path, { state: { username } });
    };

    const handleCreateParty = async() => {
        alert("Hey this works");
    }

    const getParties = async() => {
        const result = await axios.get(
            `${API_URL}/parties`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setParties(result.data);
    }

    const ReadParties = () => {
        const items = parties.map((party, ind) => (
            <Party key={ind} Name={party.name} Description={party.description} Categories={party.categories} Count={party.maxMembers} Members={party.members}/>
        ));
        return(
            <div>{items}</div>
        )
    }
    useEffect(() => {
        getParties();
    }, []);

    return(
        <div className="page-container">
            <NavBar/>

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
                placeholder='Enter the name Or Category of a Party you want to find!'
            />
        </div>
        <div className="createButton">
            <button className='create-button' onClick={handleCreateParty}>
                Create Party
            </button>
            <img src={plus} alt="pluslogo" className='plus-img'/>
        </div>

        </div>
        <h2>Available Parties</h2>
        <ReadParties/>
    </div>
             
            </div>
    );
}

export default PartyFinderPage;