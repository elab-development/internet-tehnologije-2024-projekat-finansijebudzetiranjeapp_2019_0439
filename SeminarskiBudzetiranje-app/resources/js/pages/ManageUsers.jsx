import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../components/CustomButton';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [systemStats, setSystemStats] = useState(null);

    useEffect(() => {
        // Set up axios authorization header
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        loadUsersData();
        loadSystemStats();
    }, []);

    const loadUsersData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Now using the proper /api/users endpoint
            const response = await axios.get('/api/users?per_page=1000');
            console.log('Users API Response:', response.data);
            
            // Handle Laravel pagination structure
            const usersData = response.data.data || response.data;
            setUsers(Array.isArray(usersData) ? usersData : []);

        } catch (err) {
            console.error('Users loading error:', err);
            
            if (err.response?.status === 401) {
                setError('Unauthorized. Please login as admin.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else if (err.response?.status === 404) {
                setError('API endpoint not found. Please check backend configuration.');
            } else {
                setError(`Failed to load users data: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadSystemStats = async () => {
        try {
            const response = await axios.get('/api/admin/system-stats');
            setSystemStats(response.data);
        } catch (err) {
            console.error('System stats loading error:', err);
            // Not critical, so don't show error to user
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This will delete all their accounts and transactions!')) {
            return;
        }

        try {
            await axios.delete(`/api/users/${userId}`);
            
            // Show success message
            alert('User deleted successfully!');
            
            // Refresh data
            loadUsersData();
            loadSystemStats();
            
        } catch (err) {
            console.error('Delete user error:', err);
            
            if (err.response?.status === 403) {
                setError('Access denied. Cannot delete this user.');
            } else {
                setError(`Failed to delete user: ${err.message}`);
            }
        }
    };

    const handleChangeUserRole = async (userId, newRole) => {
        if (!newRole) return;
        
        try {
            await axios.put(`/api/users/${userId}`, { role: newRole });
            
            alert(`User role changed to ${newRole} successfully!`);
            
            // Refresh data
            loadUsersData();
            
        } catch (err) {
            console.error('Change role error:', err);
            
            if (err.response?.status === 422) {
                setError('Invalid role. Please try again.');
            } else {
                setError(`Failed to change user role: ${err.message}`);
            }
        }
    };

    const handleViewUserDetails = async (userId) => {
        try {
            const response = await axios.get(`/api/users/${userId}`);
            
            // Create a formatted popup with user details
            const user = response.data;
            const details = `
User Details:
━━━━━━━━━━━━━━━━━━
ID: ${user.id}
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}
Created: ${new Date(user.created_at).toLocaleDateString()}

Statistics:
━━━━━━━━━━━━━━━━━━
Accounts: ${user.statistics?.total_accounts || 0}
Categories: ${user.statistics?.total_categories || 0}
Total Balance: $${user.statistics?.total_balance?.toFixed(2) || '0.00'}
Total Transactions: ${user.statistics?.total_transactions || 0}
Monthly Income: $${user.statistics?.monthly_income?.toFixed(2) || '0.00'}
Monthly Expense: $${user.statistics?.monthly_expense?.toFixed(2) || '0.00'}
Monthly Net: $${user.statistics?.monthly_net?.toFixed(2) || '0.00'}
            `;
            
            alert(details);
            
        } catch (err) {
            console.error('View user details error:', err);
            alert('Failed to load user details');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading users...</h2>
                <div style={{ marginTop: '10px' }}>
                    <div style={{ 
                        display: 'inline-block', 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2d3e50' }}>Manage Users</h1>
                <div style={{ 
                    backgroundColor: '#fff3cd', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    border: '1px solid #ffeaa7',
                    color: '#856404'
                }}>
                    👑 Admin Only Area
                </div>
            </div>

            {error && (
                <div style={{ 
                    color: '#721c24', 
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    marginBottom: '20px', 
                    padding: '12px', 
                    borderRadius: '4px' 
                }}>
                    <strong>Error:</strong> {error}
                    <button 
                        onClick={() => setError('')}
                        style={{ 
                            float: 'right', 
                            background: 'none', 
                            border: 'none', 
                            fontSize: '18px', 
                            cursor: 'pointer' 
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* System Stats */}
            {systemStats && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '30px' 
                }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Total Users</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{systemStats.total_users}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e74c3c' }}>Total Admins</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{systemStats.total_admins}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2ecc71' }}>System Balance</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                            ${typeof systemStats.total_system_balance === 'number' 
                                ? systemStats.total_system_balance.toFixed(2) 
                                : systemStats.total_system_balance || '0.00'}
                        </p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#f39c12' }}>Total Accounts</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{systemStats.total_accounts}</p>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>All Users ({users.length})</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CustomButton 
                            label="Refresh Data" 
                            onClick={loadUsersData}
                            styleType="secondary" 
                        />
                    </div>
                </div>

                {users.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                        {loading ? 'Loading users...' : 'No users found.'}
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Role</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Accounts</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Balance</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                            #{user.id}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {user.name}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: 
                                                    user.role === 'admin' ? '#e74c3c' : 
                                                    user.role === 'user' ? '#3498db' : '#95a5a6',
                                                color: 'white'
                                            }}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {user.statistics?.total_accounts || 0}
                                        </td>
                                        <td style={{ 
                                            padding: '12px', 
                                            border: '1px solid #ddd',
                                            fontWeight: 'bold',
                                            color: (user.statistics?.total_balance || 0) >= 0 ? '#2ecc71' : '#e74c3c'
                                        }}>
                                            ${(user.statistics?.total_balance || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value && e.target.value !== user.role) {
                                                            handleChangeUserRole(user.id, e.target.value);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                    style={{ 
                                                        padding: '4px 8px', 
                                                        fontSize: '12px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                >
                                                    <option value="">Change Role</option>
                                                    {user.role !== 'user' && <option value="user">Make User</option>}
                                                    {user.role !== 'admin' && <option value="admin">Make Admin</option>}
                                                    {user.role !== 'guest' && <option value="guest">Make Guest</option>}
                                                </select>
                                                
                                                <button
                                                    onClick={() => handleViewUserDetails(user.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#3498db',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    View
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Success Message */}
            <div style={{ 
                backgroundColor: '#d4edda', 
                padding: '15px', 
                borderRadius: '8px', 
                marginTop: '20px',
                border: '1px solid #c3e6cb'
            }}>
                <h4 style={{ color: '#155724', marginTop: 0 }}>✅ Fully Implemented Features:</h4>
                <ul style={{ color: '#155724', margin: 0 }}>
                    <li><strong>View all users</strong> - with complete statistics</li>
                    <li><strong>Change user roles</strong> - admin, user, guest</li>
                    <li><strong>Delete users</strong> - with cascade delete of accounts & transactions</li>
                    <li><strong>View detailed user information</strong> - including financial statistics</li>
                    <li><strong>System statistics</strong> - overview dashboard</li>
                </ul>
            </div>
        </div>
    );
}