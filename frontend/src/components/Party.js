import "./PF.css";
import sword from '../images/sword.png';
import { useState } from "react";
import API_URL from "../config/api";
import axios from "axios";
import MembersOverlay from "./Overlays/MembersOverlay";
import ErrorMessage from "./Overlays/ErrorMessage";

function Party({Name, Description, Categories, Count, id, Members, Status, CreatorId, refresh, refreshCurrent}) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const [error, setError] = useState("");
    const [categories, setCategories] = useState(Categories);
    const isOwner = (userId===CreatorId);
    const isMember = Members.includes(userId);
    const [isOpen, setIsOpen] = useState(false);
    const cats = categories.map((category,index) =>(
        <p className='catbox' key={index}> {category}</p>));
    
    const handleOpenMembers = () => {
        setIsOpen(!isOpen);
    }

    const handleCloseMembers = () => {
        setIsOpen(false);
    }

    const buttonTest = async () => {
        try {
            await axios.put(
                `${API_URL}/parties/${Name}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refresh();
            refreshCurrent();
        } catch(error) {
            console.error("Couldnt Join Party:", error.response?.data || error.message);
            setError({ text: error.response?.data, id: Date.now() });

        }
    };

    const handleDeleteParty = async () => {
        try {
            await axios.delete(
                `${API_URL}/parties/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refresh();
            refreshCurrent();
        } catch(error) {
            console.error("Couldn't delete the party: ", error.response?.data || error.message);
            setError({ text: error.response?.data, id: Date.now() });
        }
    }

    const handleLeaveParty = async() => {
        try {
            await axios.put(
                `${API_URL}/parties/${Name}/leave`,{},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refresh();
            refreshCurrent();

        } catch(error) {
            console.error("Couldn't leave the party", error.response.data);
            setError({ text: error.response?.data, id: Date.now() });
        }
    }


    return ( 
        <>
             <ErrorMessage Message={error} />
            <MembersOverlay isOpen={isOpen} onClose={handleCloseMembers} members={Members} CreatorId={CreatorId} partyName={Name} refresh={refresh} refreshCurrent={refreshCurrent}/>
            <div className='partyInfo'>
                <img src={sword} alt="sword" className='party-img'></img>
                <div className='text-container'>
                    <h3>{Name}</h3>
                    <p>{Description}</p>
                    <div className='category-list'>
                        {cats}
                    </div>
                    <p className='members' onClick={handleOpenMembers}> {Members.length}/{Count} Players</p>
                </div>
                <div className='right'>
                    <p className='active'>{Status}</p>
                    {
                        isOwner?(
                            <button className='deleteparty' onClick={handleDeleteParty}>Delete</button>
                        ): isMember? (
                            <button className='leaveparty' onClick={handleLeaveParty}>Leave Party</button>
                        ): <button className='joinparty' onClick={buttonTest}>Join Party</button>
                    }
                </div>
            </div>
        </>
    );
}

export default Party;