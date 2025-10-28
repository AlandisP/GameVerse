import './styles.css';
//import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
function LoginScreen() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // const HandleLogin = async() => {
    //     try {
    //         if(!username || !password) {
    //             setError('Please fill in the fields');
    //             return;
    //         }
    //     }
    // }

    const HandleClick = () =>{
        alert("I Clicked");
    }

    return (
        <div className="LoginScreen">
            <h1>Please Login!</h1>
            <div className="Username">
                <h3>Username</h3>
                <input 
                className="InputBox" 
                type='text'
                id= 'userinput'
                placeholder='Username'
                onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="Password">
                <h3>Password</h3>
                <input 
                className="InputBox" 
                type='text'
                id='passinput'
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button className = "LoginButton" onClick={HandleClick}>
                Login
            </button>

        </div>
    )

}

export default LoginScreen;