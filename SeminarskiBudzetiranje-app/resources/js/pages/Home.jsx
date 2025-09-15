import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import Card from '../components/Card';

export default function Home() {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        totalAccounts: 0,
        totalBalance: 0,
        recentTransactions: [],
        monthlyIncome: 0,
        monthlyExpenses: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Proveri da li je korisnik ulogovan
    const isLoggedIn = () => !!localStorage.getItem('token');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadDashboardData();
        } else {
            setLoading(false);
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Paralelno učitavanje podataka
            const [accountsRes, transactionsRes, categoriesRes] = await Promise.all([
                axios.get('/api/accounts'),
                axios.get('/api/transactions?per_page=5'), // Poslednje 5 transakcija
                axios.get('/api/categories')
            ]);

            const accounts = accountsRes.data.data || accountsRes.data;
            const transactions = transactionsRes.data.data || transactionsRes.data;
            const categories = categoriesRes.data.data || categoriesRes.data;

            // Računaj ukupan balans
            const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);

            // Računaj mesečni income/expenses (trenutni mesec)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            let monthlyIncome = 0;
            let monthlyExpenses = 0;

            // Dobijamo sve transakcije za trenutni mesec
            try {
                const monthlyTransactionsRes = await axios.get('/api/transactions', {
                    params: {
                        date_from: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
                        date_to: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`,
                        per_page: 1000 // Uzmi sve za ovaj mesec
                    }
                });

                const monthlyTransactions = monthlyTransactionsRes.data.data || monthlyTransactionsRes.data;
                
                monthlyTransactions.forEach(transaction => {
                    const category = categories.find(cat => cat.id === transaction.category_id);
                    const amount = parseFloat(transaction.amount);
                    
                    if (category) {
                        if (category.type === 'income') {
                            monthlyIncome += amount;
                        } else if (category.type === 'expense') {
                            monthlyExpenses += Math.abs(amount);
                        }
                    }
                });
            } catch (monthlyError) {
                console.error('Error loading monthly transactions:', monthlyError);
            }

            setDashboardData({
                totalAccounts: accounts.length,
                totalBalance,
                recentTransactions: transactions.slice(0, 5),
                monthlyIncome,
                monthlyExpenses
            });

        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setDashboardData({
            totalAccounts: 0,
            totalBalance: 0,
            recentTransactions: [],
            monthlyIncome: 0,
            monthlyExpenses: 0
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!isLoggedIn()) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#2d3e50' }}>
                    Welcome to Finance Tracker
                </h1>
                <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
                    Take control of your finances. Track expenses, manage budgets, and achieve your financial goals.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
                    <Card
                        title="Track Expenses"
                        description="Monitor your daily expenses and see where your money goes."
                        image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop"
                        onAction={() => alert('Please login to access this feature')}
                    />
                    
                    <Card
                        title="Manage Accounts"
                        description="Keep track of multiple bank accounts and their balances."
                        image="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop"
                        onAction={() => alert('Please login to access this feature')}
                    />
                    
                    <Card
                        title="Budget Planning"
                        description="Set budgets and monitor your spending against your goals."
                        image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop"
                        onAction={() => alert('Please login to access this feature')}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <Link to="/login">
                        <CustomButton label="Get Started - Login" styleType="primary" />
                    </Link>
                </div>

                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
                    <h3>Why Choose Finance Tracker?</h3>
                    <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                        <li>✅ Secure and private - your data stays with you</li>
                        <li>✅ Multiple account management</li>
                        <li>✅ Detailed expense categorization</li>
                        <li>✅ Real-time balance tracking</li>
                        <li>✅ Monthly and yearly reports</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', color: '#2d3e50' }}>Financial Dashboard</h1>
                <CustomButton 
                    label="Logout" 
                    onClick={handleLogout} 
                    styleType="secondary" 
                />
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* Key Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#4caf50', marginBottom: '10px' }}>Total Balance</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                        ${dashboardData.totalBalance.toFixed(2)}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        Across {dashboardData.totalAccounts} account{dashboardData.totalAccounts !== 1 ? 's' : ''}
                    </p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#2196f3', marginBottom: '10px' }}>Monthly Income</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>
                        +${dashboardData.monthlyIncome.toFixed(2)}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>This month</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#ff9800', marginBottom: '10px' }}>Monthly Expenses</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f44336' }}>
                        -${dashboardData.monthlyExpenses.toFixed(2)}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>This month</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#9c27b0', marginBottom: '10px' }}>Net Income</h3>
                    <p style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        margin: 0,
                        color: (dashboardData.monthlyIncome - dashboardData.monthlyExpenses) >= 0 ? '#4caf50' : '#f44336'
                    }}>
                        ${(dashboardData.monthlyIncome - dashboardData.monthlyExpenses).toFixed(2)}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>This month</p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Recent Transactions</h3>
                    <Link to="/transactions">
                        <CustomButton label="View All" styleType="secondary" />
                    </Link>
                </div>

                {dashboardData.recentTransactions.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        No transactions yet. <Link to="/transactions">Add your first transaction</Link>
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Amount</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Account</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentTransactions.map(transaction => (
                                    <tr key={transaction.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {transaction.transaction_date}
                                        </td>
                                        <td style={{ 
                                            padding: '10px', 
                                            border: '1px solid #ddd',
                                            fontWeight: 'bold',
                                            color: parseFloat(transaction.amount) >= 0 ? '#4caf50' : '#f44336'
                                        }}>
                                            ${parseFloat(transaction.amount).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            Account #{transaction.account_id}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            Category #{transaction.category_id}
                                        </td>
                                    </tr>
                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }