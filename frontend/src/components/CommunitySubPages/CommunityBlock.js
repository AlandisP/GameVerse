import React, { useState, useEffect, useSyncExternalStore } from 'react';
import "./ExploreCommunities.css";
import backbtn from "../../images/u-turn-arrow.png"
import logo from "../../images/search.png"
import API_URL from '../../config/api';
import axios from 'axios';
function CommunityBlock({Name, Description, Members, Category, id, OwnerId}) {


    return (
        <div className='communityBlock'>
            <div className='emptyBox'></div>
            <div className='text-container'>
                <p className='comName'>{Name}</p>
                <p className='memberCount'>{Members} Members</p>
                <p>{Description}</p>
            </div>
            <div className='right'>
                <button className='joinbtn'>Join</button>
            </div>
        </div>
    );

}

export default CommunityBlock;