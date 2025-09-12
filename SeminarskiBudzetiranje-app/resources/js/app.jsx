import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Stranice
import Home from './pages/Home';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

// Glavna App komponenta
function App() {
    return (
        <Router>
            <nav style={{ padding: '10px', background: '#f0f0f0' }}>
                <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
                <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                <Link to="/transactions">Transactions</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/transactions" element={<Transactions />} />
            </Routes>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);