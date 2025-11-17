import './styles.css';
//import { useNavigate } from 'react-router-dom';
import logo from '../images/GameVerse_LogoV2.png';
import React, { useState } from 'react';
function LoginScreen() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pwdverify, setVerify] = useState('');
    const [error, setError] = useState('');

    // const numbers = Array.from({ length: 77 }, (x, i) => i + 1950);
    // const days = Array.from({ length: 31 }, (x, i) => i + 1);

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
                type='text'
                id='passinput'
                placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="VerPassword">
                <h3>Confirm Password</h3>
                <input 
                className="InputBox" 
                type='text'
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
                <select name='Platform' required>
                    <option selected disabled hidden>Select Platform</option>
                    <option value='PS'>Playstation</option>
                    <option value='PC'>PC</option>
                    <option value='XB'>Xbox</option>
                </select>
            </div>
            <button className = "SignupButton" >
                Create Account
            </button>
            <div className='login'>
                <p>Already have an account?</p>
                <p>Log In!</p>
            </div>

        </div>
        </div>
        </div>
    )

}

export default LoginScreen;