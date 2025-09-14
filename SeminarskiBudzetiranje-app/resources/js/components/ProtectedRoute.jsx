import React from 'react';
import { Navigate } from 'react-router-dom';

// Utility funkcije za auth
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const hasRole = (requiredRole) => {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
};

// ProtectedRoute komponenta - zaštićuje rute od neautentifikovanih korisnika
export const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// RoleBasedRoute - zaštićuje rute na osnovu uloge
export const RoleBasedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    
    if (!hasRole(allowedRoles)) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: '#f44336' }}>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <p>Required role(s): {Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}</p>
            </div>
        );
    }
    
    return children;
};

export default ProtectedRoute;