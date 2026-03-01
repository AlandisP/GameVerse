import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Home.css';
import NavBar from "./NavBar";

function SettingsPage() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetStates = () => {
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    const closeAllModals = () => {
        setShowUsernameModal(false);
        setShowPasswordModal(false);
        setShowDeleteModal(false);
        resetStates();
    };

    const handleChangeUsername = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!newUsername.trim()) { setError('Please enter a new username'); return; }
            await axios.put(`${API_URL}/users/change-username`,
                { newUsername: newUsername.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.setItem('username', newUsername.trim());
            setSuccess('Username updated successfully!');
            setTimeout(() => closeAllModals(), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update username');
        }
    };

    const handleChangePassword = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!currentPassword || !newPassword || !confirmPassword) { setError('Please fill in all password fields'); return; }
            if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
            if (newPassword.length < 6) { setError('Password must be at least 6 characters long'); return; }
            await axios.put(`${API_URL}/users/change-password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Password updated successfully!');
            setTimeout(() => closeAllModals(), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        }
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!currentPassword) { setError('Please enter your password to confirm account deletion'); return; }
            await axios.delete(`${API_URL}/users/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { password: currentPassword }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
        }
    };

    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    };
    const modalStyle = {
        background: '#2a2a2a', padding: '20px', borderRadius: '8px',
        width: '90%', maxWidth: '500px', color: 'white', boxSizing: 'border-box'
    };
    const modalInputStyle = {
        width: '100%', padding: '10px', margin: '10px 0',
        background: '#1a1a1a', border: '1px solid #444',
        borderRadius: '4px', color: 'white', boxSizing: 'border-box',
        fontSize: '16px'
    };
    const modalButtonsStyle = { display: 'flex', gap: '10px', marginTop: '20px' };
    const primaryButtonStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '4px', background: '#0066cc', color: 'white', cursor: 'pointer' };
    const secondaryButtonStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '4px', background: '#666', color: 'white', cursor: 'pointer' };
    const deleteButtonStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '4px', background: 'red', color: 'white', cursor: 'pointer' };
    const settingsOptionStyle = { cursor: 'pointer', padding: '15px 20px', borderBottom: '1px solid #333', color: 'white', transition: 'background-color 0.2s' };
    const errorTextStyle = { color: 'red', margin: '10px 0' };
    const successTextStyle = { color: 'green', margin: '10px 0' };

    return (
        <div className="page-container">
            <NavBar />
            <div className="main-content">
                <div style={{ borderBottom: "1px solid #000000ff", paddingBottom: "10px", marginLeft: "-20px", paddingLeft: "20px" }}>
                    <h1 style={{ color: "white", textAlign: "left", marginTop: "50px", marginLeft: "20px", marginBottom: "0" }}>
                        Settings
                    </h1>
                </div>

                <div>
                    {[
                        { label: 'Change Username', action: () => setShowUsernameModal(true) },
                        { label: 'Change Password', action: () => setShowPasswordModal(true) },
                        { label: 'Delete Account', action: () => setShowDeleteModal(true) },
                    ].map(({ label, action }) => (
                        <div
                            key={label}
                            style={settingsOptionStyle}
                            onClick={action}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {showUsernameModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Change Username</h2>
                            <p>Current username: {username}</p>
                            <input className="modal-input" style={modalInputStyle} type="text" placeholder="Enter new username"
                                value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            {error && <p style={errorTextStyle}>{error}</p>}
                            {success && <p style={successTextStyle}>{success}</p>}
                            <div style={modalButtonsStyle}>
                                <button style={primaryButtonStyle} onClick={handleChangeUsername}>Update Username</button>
                                <button style={secondaryButtonStyle} onClick={closeAllModals}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {showPasswordModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Change Password</h2>
                            <input className="modal-input" style={modalInputStyle} type="password" placeholder="Current password"
                                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            <input className="modal-input" style={modalInputStyle} type="password" placeholder="New password"
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <input className="modal-input" style={modalInputStyle} type="password" placeholder="Confirm new password"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            {error && <p style={errorTextStyle}>{error}</p>}
                            {success && <p style={successTextStyle}>{success}</p>}
                            <div style={modalButtonsStyle}>
                                <button style={primaryButtonStyle} onClick={handleChangePassword}>Update Password</button>
                                <button style={secondaryButtonStyle} onClick={closeAllModals}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Delete Account</h2>
                            <p style={{ color: 'red' }}>⚠️ This action cannot be undone!</p>
                            <p>Enter your password to confirm account deletion:</p>
                            <input className="modal-input" style={modalInputStyle} type="password" placeholder="Enter your password"
                                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            {error && <p style={errorTextStyle}>{error}</p>}
                            <div style={modalButtonsStyle}>
                                <button style={deleteButtonStyle} onClick={handleDeleteAccount}>Delete Account</button>
                                <button style={secondaryButtonStyle} onClick={closeAllModals}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPage;