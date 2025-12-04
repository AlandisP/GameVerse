import './styles.css';
import { useNavigate } from 'react-router-dom';
import logo from '../images/GameVerse_LogoV2.png';
import React, { useState } from 'react';
import axios from 'axios';
function Signup() {

    const history = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setVerify] = useState('');
    const [error, setError] = useState('');
    const [platform, setSelectedValue] = useState('Null');

    // const numbers = Array.from({ length: 77 }, (x, i) => i + 1950);
    // const days = Array.from({ length: 31 }, (x, i) => i + 1);

    const HandleChange = (e) => {
        setSelectedValue(e.target.value);
    }

    const HandleSignUp = async () => {
        try {
            if(!username || !password || !confirmPassword) {
                setError('Please fill in the fields');
                return;
            }
            const response = await axios.post('http://localhost:8080/auth/signup', {username, password, confirmPassword, platform});
            setError("Account Created!");
            console.log('Create Account Successful:', response.data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('page', '/');
            history('/home');
        } catch(error) {
            console.error('Account Creation failed:', error.response ? error.response.data: error.message);
            setError(error.response.data);  
        }
        
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
            <h1>Create Account</h1>
            <p className='intro-text'>Create an account to start connecting with other gamers!</p>
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
                type='password'
                id='passinput'
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="VerPassword">
                <h3>Confirm Password</h3>
                <input 
                className="InputBox" 
                type='password'
                id='passinput'
                placeholder='Password'
                onChange={(e) => setVerify(e.target.value)}
                />
            </div>
            {/* <div className="Bday">
                <h3>Birthday</h3>
                <div className='BdayInput'>
                    <select name='Month' required>
                        <option selected disabled hidden>Month</option>
                        <option value='jan'>January</option>
                        <option value='feb'>Febuary</option>
                        <option value='mar'>March</option>
                        <option value='apr'>April</option>
                        <option value='may'>May</option>
                        <option value='jun'>June</option>
                        <option value='jul'>July</option>
                        <option value='aug'>August</option>
                        <option value='sep'>September</option>
                        <option value='oct'>October</option>
                        <option value='nov'>November</option>
                        <option value='dec'>December</option>
                    </select>
                    <select name='Day' required>
                        <option selected disabled hidden>Day</option>
                        {days.map((day,ind)=>(
                            <option value={day} key={ind}>{day}</option>
                        ))}
                    </select>
                    <select name='Year' required>
                        <option selected disabled hidden>Year</option>
                        {numbers.map((year,ind)=>(
                            <option value={year} key={ind}>{year}</option>
                        ))}
                    </select>
                </div>
            </div> */}
            <div className='Platform'>
                <div className='Plat'>
                    <h3>Platform</h3>
                </div>
                <select name='Platform' required value={platform} onChange={HandleChange}>
                    <option selected disabled hidden value="Null">Select Platform</option>
                    <option value='PS'>Playstation</option>
                    <option value='PC'>PC</option>
                    <option value='XB'>Xbox</option>
                    <option value='NI'>Nintendo</option>
                </select>
            </div>
            <button className = "LoginButton" onClick={HandleSignUp}>
                Create Account
            </button>
            <p className='Create-Account'>
                Already have an Account? <a  href = "/" className='CA-Link'>Log In!</a>
            </p>
            <p className='error-text'>
                {error}
            </p>

        </div>
        </div>
        </div>
    )

}

export default Signup;