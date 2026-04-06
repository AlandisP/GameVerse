import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Home.css';
import NavBar from "./NavBar";
import PostObj from './Post';

function SettingsPage() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [showBookmarksModal, setShowBookmarksModal] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarkIds, setBookmarkIds] = useState([]);
    const [loadingBlocked, setLoadingBlocked] = useState(false);
    const [loadingBookmarks, setLoadingBookmarks] = useState(false);

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
        setShowBlockedModal(false);
        setShowBookmarksModal(false);
        setBlockedUsers([]);
        setBookmarks([]);
        setBookmarkIds([]);
        resetStates();
    };

    const handleChangeUsername = async () => {
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

    const handleViewBlocked = async () => {
        setLoadingBlocked(true);
        setShowBlockedModal(true);
        try {
            const res = await axios.get(`${API_URL}/profile/getBlockList`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlockedUsers(res.data);
        } catch (err) {
            setError('Failed to load blocked users');
        } finally {
            setLoadingBlocked(false);
        }
    };

    const handleViewBookmarks = async () => {
        setLoadingBookmarks(true);
        setShowBookmarksModal(true);
        try {
            // Step 1: get list of bookmarked post IDs
            const res = await axios.get(`${API_URL}/post/getbooks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ids = res.data || [];
            setBookmarkIds(ids);

            if (ids.length === 0) {
                setBookmarks([]);
                return;
            }

            // Step 2: fetch each post, injecting _bookmarkId so removebookmark always has the right ID
            const postDetails = await Promise.all(
                ids.map(id =>
                    axios.get(`${API_URL}/post/id/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    .then(r => ({ ...r.data, _bookmarkId: id }))
                    .catch(() => null)
                )
            );
            setBookmarks(postDetails.filter(p => p !== null));
        } catch (err) {
            setError('Failed to load bookmarks');
        } finally {
            setLoadingBookmarks(false);
        }
    };

    // Called by PostObj when user unbookmarks — mirrors how HomePage uses setbooks
    const handleBookmarkChange = (removedId) => {
        setBookmarkIds(prev => prev.filter(id => id !== removedId));
        setBookmarks(prev => prev.filter(p => (p._bookmarkId ?? p.id) !== removedId));
    };

    const parselike = (post) => {
        const liked = post.liked || {};
        return liked[username];
    };

    const handleUnblock = async (user) => {
        const identifier = typeof user === 'string' ? user : user.username;
        try {
            await axios.post(`${API_URL}/profile/unblock/${identifier}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlockedUsers(prev => prev.filter(u => u !== user && (u.username || u) !== identifier));
        } catch (err) {
            setError('Failed to unblock user');
        }
    };

    const getDisplayName = (user) => {
        if (typeof user === 'string') return user;
        return user.username || user.id || JSON.stringify(user);
    };

    // Styles
    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    };
    const modalStyle = {
        background: '#2a2a2a', padding: '20px', borderRadius: '8px',
        width: '90%', maxWidth: '600px', color: 'white', boxSizing: 'border-box'
    };
    const bookmarksModalStyle = {
        ...modalStyle,
        maxWidth: '650px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
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
                        { label: 'View Blocked Users', action: handleViewBlocked },
                        { label: 'View Bookmarks', action: handleViewBookmarks },
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

                {/* Change Username Modal */}
                {showUsernameModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Change Username</h2>
                            <p>Current username: {username}</p>
                            <input style={modalInputStyle} type="text" placeholder="Enter new username"
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

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Change Password</h2>
                            <input style={modalInputStyle} type="password" placeholder="Current password"
                                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            <input style={modalInputStyle} type="password" placeholder="New password"
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <input style={modalInputStyle} type="password" placeholder="Confirm new password"
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

                {/* Delete Account Modal */}
                {showDeleteModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Delete Account</h2>
                            <p style={{ color: 'red' }}>⚠️ This action cannot be undone!</p>
                            <p>Enter your password to confirm account deletion:</p>
                            <input style={modalInputStyle} type="password" placeholder="Enter your password"
                                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            {error && <p style={errorTextStyle}>{error}</p>}
                            <div style={modalButtonsStyle}>
                                <button style={deleteButtonStyle} onClick={handleDeleteAccount}>Delete Account</button>
                                <button style={secondaryButtonStyle} onClick={closeAllModals}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Blocked Users Modal */}
                {showBlockedModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white' }}>Blocked Users</h2>
                            {loadingBlocked ? (
                                <p style={{ color: '#aaa' }}>Loading...</p>
                            ) : blockedUsers.length === 0 ? (
                                <p style={{ color: '#aaa' }}>You haven't blocked anyone.</p>
                            ) : (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {blockedUsers.map((user, index) => (
                                        <div key={index} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', padding: '10px 0',
                                        }}>
                                            <span style={{ color: 'white' }}>{getDisplayName(user)}</span>
                                            <button
                                                onClick={() => handleUnblock(user)}
                                                style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: '#555', color: 'white', cursor: 'pointer' }}
                                            >
                                                Unblock
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {error && <p style={errorTextStyle}>{error}</p>}
                            <div style={modalButtonsStyle}>
                                <button style={secondaryButtonStyle} onClick={closeAllModals}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bookmarks Modal — uses PostObj just like HomePage */}
                {showBookmarksModal && (
                    <div style={modalOverlayStyle} onClick={closeAllModals}>
                        <div style={bookmarksModalStyle} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ marginTop: 0, color: 'white', flexShrink: 0 }}>Bookmarks</h2>
                            {loadingBookmarks ? (
                                <p style={{ color: '#aaa' }}>Loading...</p>
                            ) : bookmarks.length === 0 ? (
                                <p style={{ color: '#aaa' }}>You have no bookmarks.</p>
                            ) : (
                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    {bookmarks.map((post) => {
                                        const postId = post._bookmarkId ?? post.id;
                                        return (
                                            <PostObj
                                                key={postId}
                                                User={post.user}
                                                Content={post.text}
                                                Likes={post.likes}
                                                Liked={parselike(post)}
                                                id={postId}
                                                commcount={post.comments?.length ?? 0}
                                                books={true}
                                                CreatedAt={post.createdAt}
                                                CommunityName={post.communityName}
                                                media={post.media}
                                                type={post.mediaType}
                                                setbooks={(updater) => {
                                                    // Support both function and direct value like HomePage's setbooks
                                                    const newIds = typeof updater === 'function'
                                                        ? updater(bookmarkIds)
                                                        : updater;
                                                    // Find which ID was removed
                                                    const removed = bookmarkIds.find(id => !newIds.includes(id));
                                                    if (removed) handleBookmarkChange(removed);
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {error && <p style={errorTextStyle}>{error}</p>}
                            <div style={{ ...modalButtonsStyle, flexShrink: 0 }}>
                                <button style={secondaryButtonStyle} onClick={closeAllModals}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPage;