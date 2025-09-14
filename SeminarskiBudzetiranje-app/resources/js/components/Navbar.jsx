import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 p-4">
            <Link to="/" className="text-white hover:text-green-400 mr-4">Home</Link>
            <Link to="/login" className="text-white hover:text-green-400 mr-4">Login</Link>
            <Link to="/transactions" className="text-white hover:text-green-400">Transactions</Link>
        </nav>
    );
}