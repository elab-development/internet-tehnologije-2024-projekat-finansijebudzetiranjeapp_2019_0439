import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Stranice
import '../css/app.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

// Komponente
import Navbar from './components/Navbar';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/transactions" element={<Transactions />} />
            </Routes>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);