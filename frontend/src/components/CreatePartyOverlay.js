import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "./NavBar";
import "./PF.css";
import "./Overlay.css";
import logo from '../images/search.png';
import plus from '../images/plus.png';
import sword from '../images/sword.png';
import API_URL from '../config/api';
import axios from 'axios';


function CreatePartyOverlay({isOpen, onClose}) {

    return (
        <>
        {isOpen ? (
            <div className='overlay'>
                <div className='overlay-background'>
                    <div className='top-portion'>
                        <h1 className='header'>Create Party</h1>
                        <button className='close' onClick={onClose}>Close</button>
                    </div>
                    <div className='contents'>
                        <h2>Party Name</h2>
                        <input className='inputs' placeholder='Enter Party Name'></input>
                        <h2>Description</h2>
                        <input className='inputs' placeholder='Enter Party Description'></input>
                        <h2>Number of Members</h2>
                        <input className='inputs2' placeholder='Enter Number of Members'></input>
                        <h2>Select Categories</h2>
                    </div>
                </div>

            </div>

        ):"" }

        </>

    );

}
export default CreatePartyOverlay;