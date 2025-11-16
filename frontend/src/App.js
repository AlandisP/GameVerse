import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginScreen from './components/LoginScreen';

function App() {
  return (
  <div className="App">
        <Router>
              <Routes>
              <Route path="/" element={<LoginScreen/>} />
                  <Route path = "/home" element={<HomePage/>}/>
              </Routes>

        </Router>
        </div>
    );
}

export default App;
