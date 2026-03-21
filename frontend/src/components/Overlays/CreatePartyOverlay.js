// import React, { useState, useEffect } from 'react';
// import "../PF.css";
// import "../Overlay.css";
// import API_URL from '../../config/api';
// import axios from 'axios';
// import ErrorMessage from './ErrorMessage';
// import { useActionData } from 'react-router-dom';
// import Select from 'react-select'

// function CreatePartyOverlay({isOpen, onClose, onPartyCreated}) {
//     const [categories, setCategories] = useState([]);
//     const[items, setItems] = useState([]);
//     const token  = localStorage.getItem('token');
//     const [partyName, setPartyName] = useState("");
//     const [partyDescription, setDescription] = useState("");
//     const [number, setNumber] = useState('');
//     const [error, setError] = useState("");

//     const handleSelectCategory = (selectedOptions) => {
//         setItems(selectedOptions || []);
//     };

//     useEffect(() => {
//         const getCategories = async () => {
//             const result = await axios.get(
//                 `${API_URL}/parties/categories`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setCategories(result.data);
//         };
//         getCategories();
//     }, [token]);

//     const handleNameChange = (e) => {
//         setPartyName(e.target.value);
//     }

//     const handleDescriptionChange = (e) => {
//         setDescription(e.target.value);
//     }

//     const handleNumberChange = (e) => {
//         setNumber(e.target.value);
//     }


//     const handleCreate = async() => {
//         try {
//             const result = await axios.post(
//             `${API_URL}/parties/createParty`,{name: partyName, description: partyDescription, maxMembers: parseInt(number), categories: items.map(i => i.value) },
//             { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setPartyName('');
//             setDescription('');
//             setNumber('');
//             setItems([]);
//             onPartyCreated();
            
//         } catch (error) {
//             console.error("Party Creating failed:", error.response?.data || error.message);
//             setError({ text: error.response?.data, id: Date.now() });
//         }
//     };

//     const options = categories.map(c => ({
//         value: c.id,
//         label: transformString(c)
//     }));

    


//     return (
//         <>
//         {isOpen ? (
            
//             <div className='overlay'>
//                  <ErrorMessage Message={error}/>
//                 <div className='overlay-background'>
//                     <div className='top-portion'>
//                         <h1 className='header'>Create Party</h1>
//                         <button className='close' onClick={onClose}>X</button>
//                     </div>
//                     <div className='contents'>
//                         <h2 className='headers'>Party Name</h2>
//                         <input className='inputs' placeholder='Enter Party Name' onChange={handleNameChange}></input>
//                         <h2 className='headers'>Description</h2>
//                         <input className='inputs' placeholder='Enter Party Description' onChange={handleDescriptionChange}></input>
//                         <h2 className='headers' type="number">Number of Members</h2>
//                         <input className='inputs' placeholder='Enter Number of Members' onChange={handleNumberChange}></input>
//                         <h2 className='catHeader'>Select Categories</h2>
//                         <div className='select-list'>
//                             <Select className='cats-drop' name='Select Categories' onChange={handleSelectCategory} isMulti options={options} value={items}>
//                             </Select>
//                         </div>
//                     </div>
//                     <button className='create' onClick={handleCreate}>Create</button>
//                 </div>

//             </div>

//         ):"" }

//         </>

//     );

// }

// function transformString(text) {
//     const newtext = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
//     return newtext.replace(/_/g, " ");

// }
// export default CreatePartyOverlay;