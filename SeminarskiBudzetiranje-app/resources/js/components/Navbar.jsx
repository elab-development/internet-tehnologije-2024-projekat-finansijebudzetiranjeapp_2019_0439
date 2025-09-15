import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, hasRole } from './ProtectedRoute';

export default function Navbar() {
    const location = useLocation();
    const user = getCurrentUser();
    const isLoggedIn = isAuthenticated();
    const isAdmin = hasRole('admin');

    const navStyle = {
        backgroundColor: '#2c3e50',
        padding: '1rem',
        marginBottom: '0'
    };

    const listStyle = {
        listStyle: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        margin: 0,
        padding: 0,
        alignItems: 'center'
    };

    const linkStyle = {
        color: '#ecf0f1',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        transition: 'background-color 0.3s'
    };

    const activeLinkStyle = {
        ...linkStyle,
        backgroundColor: '#34495e'
    };

    const brandStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#3498db',
        textDecoration: 'none'
    };

    const userInfoStyle = {
        marginLeft: 'auto',
        color: '#bdc3c7',
        fontSize: '0.9rem'
    };

    const isActiveLink = (path) => location.pathname === path;

    return (
        <nav style={navStyle}>
            <ul style={listStyle}>
                <li>
                    <Link to="/" style={brandStyle}>
                        💰 FinanceTracker
                    </Link>
                </li>
                
                {isLoggedIn && (
                    <>
                        <li>
                            <Link 
                                to="/transactions" 
                                style={isActiveLink('/transactions') ? activeLinkStyle : linkStyle}
                            >
                                📊 Transactions
                            </Link>
                        </li>
                        
                        {/* NOVA ANALYTICS STRANICA - dostupna svim ulogovanim korisnicima */}
                        <li>
                            <Link 
                                to="/analytics" 
                                style={isActiveLink('/analytics') ? activeLinkStyle : linkStyle}
                            >
                                📈 Analytics
                            </Link>
                        </li>
                        
                        <li>
                            <Link 
                                to="/market-data" 
                                style={isActiveLink('/market-data') ? activeLinkStyle : linkStyle}
                            >
                                📈 Market Data
                            </Link>
                        </li>
                        
                        {isAdmin && (
                            <>
                                <li>
                                    <Link 
                                        to="/admin/dashboard" 
                                        style={isActiveLink('/admin/dashboard') ? activeLinkStyle : linkStyle}
                                    >
                                        👑 Admin Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/admin/users" 
                                        style={isActiveLink('/admin/users') ? activeLinkStyle : linkStyle}
                                    >
                                        👥 Manage Users
                                    </Link>
                                </li>
                            </>
                        )}
                    </>
                )}
                
                {!isLoggedIn && (
                    <li>
                        <Link 
                            to="/login" 
                            style={isActiveLink('/login') ? activeLinkStyle : linkStyle}
                        >
                            🔐 Login
                        </Link>
                    </li>
                )}
                
                {/* User Info - prikaži samo ako je korisnik ulogovan */}
                {isLoggedIn && user && (
                    <li style={userInfoStyle}>
                        Welcome, {user.name} 
                        {isAdmin && <span style={{color: '#f39c12'}}> (Admin)</span>}
                        <span style={{marginLeft: '10px'}}>
                            <Link 
                                to="/login" 
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    window.location.href = '/login';
                                }}
                                style={{...linkStyle, fontSize: '0.8rem'}}
                            >
                                Logout
                            </Link>
                        </span>
                    </li>
                )}
            </ul>
        </nav>
    );
}