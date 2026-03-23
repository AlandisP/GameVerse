import "./PF.css";
import sword from '../images/sword.png';
import { useEffect, useState } from "react";
import API_URL from "../config/api";
import axios from "axios";
import MembersOverlay from "./Overlays/MembersOverlay";
import EditPartyOverlay from "./Overlays/EditPartyOverlay";
import ErrorMessage from "./Overlays/ErrorMessage";

function Party({Name, Description, Categories, Count, id, Members, Status, CreatorId, refresh, refreshCurrent}) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const [error, setError] = useState("");
    const [categories, setCategories] = useState(Categories);
    const isOwner = (userId===CreatorId);
    const isMember = Members.includes(userId);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [image, setImage] = useState('');
    const cats = categories.map((category,index) =>(
        <p className='catbox' key={index}> {transformString(category)}</p>));
    
    const handleOpenMembers = () => {
        setIsOpen(!isOpen);
    }

    const handleCloseMembers = () => {
        setIsOpen(false);
    }

    const handleCloseEdit = () => {
        setIsOpen2(false);
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

    useEffect(() => {
        const getImage = async() => {
            try {
                const res = await axios.get(
                    `${API_URL}/parties/random-image`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setImage(res.data[0].url);
            } catch(error){
                console.error('Failed to fetch image:', error);
            }
        }
        getImage();
    },[token])


    return ( 
        <>
            <ErrorMessage Message={error} />
            <MembersOverlay isOpen={isOpen} onClose={handleCloseMembers} members={Members} CreatorId={CreatorId} partyName={Name} refresh={refresh} refreshCurrent={refreshCurrent}/>
            <EditPartyOverlay isOpen={isOpen2} onClose={handleCloseEdit} Name={Name} Description={Description} Count={Count} refresh={refresh} refreshCurrent={refreshCurrent} Categories={Categories}/>
            <div className='partyInfo'>
                <img src={image?.url} alt="randomimg" className='party-img'></img>
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
                            <div className="owner-party">
                                <button className="joinparty" onClick={() => setIsOpen2(true)}>Edit</button>
                                <button className='deleteparty' onClick={handleDeleteParty}>Delete</button>
                            </div>
                        ): isMember? (
                            <button className='leaveparty' onClick={handleLeaveParty}>Leave Party</button>
                        ): <button className='joinparty' onClick={buttonTest}>Join Party</button>
                    }
                </div>
            </div>
        </>
    );
}

function transformString(text) {
    const newtext = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    return newtext.replace(/_/g, " ");

}
export default Party;