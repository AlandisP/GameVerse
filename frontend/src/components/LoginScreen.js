import './styles.css';
//import { useNavigate } from 'react-router-dom';
import logo from '../images/GameVerse_LogoV2.png';
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
        <div className='App'>
            <div className='bg'>
        <div className='Header'>
            <div><img className='logo' src={logo}/></div>
            <div><h1 className="HeaderE" >GameVerse</h1></div>
            <div className='spacer'></div>
        </div>
        <div className="LoginScreen">
            <h1>Welcome Back!</h1>
            <p className='intro-text'>Lets hop right back into action by logging in!</p>
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
        </div>
        </div>
    )

}

export default LoginScreen;