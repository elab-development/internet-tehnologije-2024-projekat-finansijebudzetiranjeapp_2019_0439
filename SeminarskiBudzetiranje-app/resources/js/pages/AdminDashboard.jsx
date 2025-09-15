import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../components/CustomButton';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAccounts: 0,
        totalTransactions: 0,
        totalBalance: 0,
        recentUsers: [],
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAdminStats();
    }, []);

    const loadAdminStats = async () => {
        try {
            setLoading(true);
            
            // Paralelno učitavanje svih podataka
            const [accountsRes, transactionsRes] = await Promise.all([
                axios.get('/api/accounts?per_page=1000'), // Svi računi
                axios.get('/api/transactions?per_page=10') // Poslednje 10 transakcija
            ]);

            const accounts = accountsRes.data.data || accountsRes.data;
            const transactions = transactionsRes.data.data || transactionsRes.data;
            
            // Računaj statistike
            const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);
            const uniqueUsers = [...new Set(accounts.map(acc => acc.user_id))];

            setStats({
                totalUsers: uniqueUsers.length,
                totalAccounts: accounts.length,
                totalTransactions: transactionsRes.data.total || transactions.length,
                totalBalance,
                recentUsers: [], // Možete dodati API endpoint za recent users
                recentTransactions: transactions.slice(0, 5)
            });

        } catch (err) {
            setError('Failed to load admin statistics');
            console.error('Admin dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading admin dashboard...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2d3e50' }}>Admin Dashboard</h1>
                <div style={{ 
                    backgroundColor: '#d4edda', 
                    padding: '8px 15px', 
                    borderRadius: '4px',
                    border: '1px solid #c3e6cb',
                    color: '#155724'
                }}>
                    👑 Administrator Access
                </div>
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* System Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#3498db', marginBottom: '10px' }}>Total Users</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>
                        {stats.totalUsers}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>Active users in system</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#2ecc71', marginBottom: '10px' }}>Total Accounts</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>
                        {stats.totalAccounts}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>Bank accounts managed</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>Total Transactions</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>
                        {stats.totalTransactions.toLocaleString()}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>All transactions recorded</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#f39c12', marginBottom: '10px' }}>Total System Balance</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>
                        ${stats.totalBalance.toFixed(2)}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>Combined user balances</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h3>Recent System Transactions</h3>

                {stats.recentTransactions.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        No recent transactions found.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Amount</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Account ID</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Category ID</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentTransactions.map(transaction => (
                                    <tr key={transaction.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {transaction.transaction_date}
                                        </td>
                                        <td style={{ 
                                            padding: '10px', 
                                            border: '1px solid #ddd',
                                            fontWeight: 'bold',
                                            color: parseFloat(transaction.amount) >= 0 ? '#2ecc71' : '#e74c3c'
                                        }}>
                                            ${parseFloat(transaction.amount).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            #{transaction.account_id}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            #{transaction.category_id}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {transaction.account?.user_id || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Admin Actions */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px' }}>Admin Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <CustomButton 
                        label="Manage Users" 
                        onClick={() => window.location.href = '/admin/users'}
                        styleType="primary" 
                    />
                    <CustomButton 
                        label="View All Transactions" 
                        onClick={() => window.location.href = '/transactions'}
                        styleType="secondary" 
                    />
                    <CustomButton 
                        label="Refresh Stats" 
                        onClick={loadAdminStats}
                        styleType="secondary" 
                    />
                </div>
            </div>
        </div>
    );
}