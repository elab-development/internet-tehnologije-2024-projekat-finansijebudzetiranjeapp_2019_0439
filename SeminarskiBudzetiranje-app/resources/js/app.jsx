import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Styles
import '../css/app.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';

// Components
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Navbar />
            <Breadcrumbs />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes - require authentication */}
                <Route 
                    path="/transactions" 
                    element={
                        <ProtectedRoute>
                            <Transactions />
                        </ProtectedRoute>
                    } 
                />

                {/* Admin-only routes */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <RoleBasedRoute allowedRoles="admin">
                            <AdminDashboard />
                        </RoleBasedRoute>
                    } 
                />

                <Route 
                    path="/admin/users" 
                    element={
                        <RoleBasedRoute allowedRoles="admin">
                            <ManageUsers />
                        </RoleBasedRoute>
                    } 
                />

                {/* Catch all - 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}