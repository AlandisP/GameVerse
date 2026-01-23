import "./PF.css";
import logo from '../images/search.png';
import plus from '../images/plus.png';
import sword from '../images/sword.png';
import { useState } from "react";
import API_URL from "../config/api";
import axios from "axios";

function Party({Name, Description, Categories, Count, id, Members, Status}) {
    const token = localStorage.getItem("token");
    const [categories, setCategories] = useState(Categories);
    const cats = categories.map((category,index) =>(
        <p className='catbox' key={index}> {category}</p>));

    const buttonTest = async () => {
        try {
            await axios.put(
                `${API_URL}/parties/${Name}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch(error) {
            console.error("Couldnt Join Party:", error);
        }
    };

    return ( 
        <div className='partyInfo'>
            <img src={sword} alt="sword" className='party-img'></img>
            <div className='text-container'>
                <h3>{Name}</h3>
                <p>{Description}</p>
                <div className='category-list'>
                    {cats}
                </div>
                <p> {Members.length}/{Count} Players</p>
            </div>
            <div className='right'>
                <p className='active'>{Status}</p>
                <button className='joinparty' onClick={buttonTest}>Join Party</button>
            </div>
        </div>
    );
}

export default Party;