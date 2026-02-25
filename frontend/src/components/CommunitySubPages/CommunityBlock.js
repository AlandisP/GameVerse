import React, { useState, useEffect, useSyncExternalStore } from 'react';
import "./ExploreCommunities.css";
import backbtn from "../../images/u-turn-arrow.png"
import logo from "../../images/search.png"
import API_URL from '../../config/api';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
function CommunityBlock({Name, Description, Members, Category, id, OwnerId}) {
    const navigate = useNavigate();


    return (
        <div className='communityBlock' onClick={ () => navigate(`/communities/${Name}`)}>
            <div className='emptyBox'></div>
            <div className='text-container'>
                <p className='comName'>{Name}</p>
                <p className='memberCount'>{Members} Members</p>
                <p>{Description}</p>
                <p className='com-cat'>{Category}</p>
            </div>
            <div className='right'>
                <button className='joinbtn'>Join</button>
            </div>
        </div>
    );

}

export default CommunityBlock;