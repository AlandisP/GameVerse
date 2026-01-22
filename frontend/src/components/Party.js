import "./PF.css";
import logo from '../images/search.png';
import plus from '../images/plus.png';
import sword from '../images/sword.png';
import { useState } from "react";

function Party({Name, Description, Categories, Count, id, Members}) {
    const [categories, setCategories] = useState(Categories);
    const cats = categories.map((category,index) =>(
        <p className='catbox' key={index}> {category}</p>));

    const buttonTest = async () => {
        alert("Hey this works Alandis");
    }

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
                <p className='active'>Active</p>
                <button className='joinparty' onClick={buttonTest}>Join Party</button>
            </div>
        </div>
    );
}

export default Party;