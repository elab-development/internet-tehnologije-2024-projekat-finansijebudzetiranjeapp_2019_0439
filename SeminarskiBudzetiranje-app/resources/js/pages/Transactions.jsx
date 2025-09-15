import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { getCurrentUser, hasRole } from '../components/ProtectedRoute';

export default function Transactions() {
    const currentUser = getCurrentUser();
    const isAdmin = hasRole('admin');
    
    // State za transakcije i paginaciju
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [total, setTotal] = useState(0);
    
    // Filter state
    const [filters, setFilters] = useState({
        min_amount: '',
        max_amount: '',
        date_from: '',
        date_to: '',
        account_id: '',
        category_id: ''
    });
    
    // Form state za dodavanje nove transakcije
    const [newTransaction, setNewTransaction] = useState({
        account_id: '',
        category_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    // Token iz localStorage
    const getToken = () => localStorage.getItem('token');

    // Axios default headers
    useEffect(() => {
        const token = getToken();
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Učitavanje početnih podataka
    useEffect(() => {
        loadInitialData();
    }, []);

    // Učitavanje transakcija kada se promeni stranica ili filteri (ali tek nakon što su podaci učitani)
    useEffect(() => {
        if (dataLoaded) {
            loadTransactions();
        }
    }, [currentPage, perPage, filters, dataLoaded]);

    const loadInitialData = async () => {
        try {
            await Promise.all([loadAccounts(), loadCategories()]);
            setDataLoaded(true);
        } catch (err) {
            setError('Failed to load initial data');
            console.error('Error loading initial data:', err);
        }
    };

    const loadAccounts = async () => {
        try {
            const response = await axios.get('/api/accounts');
            const allAccounts = response.data.data || response.data;
            
            // Filtriraj račune - admin vidi sve, user samo svoje
            const userAccounts = isAdmin ? allAccounts : allAccounts.filter(account => account.user_id === currentUser.id);
            setAccounts(userAccounts);
            
            return userAccounts;
        } catch (err) {
            console.error('Error loading accounts:', err);
            throw err;
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            const allCategories = response.data.data || response.data;
            
            // Filtriraj kategorije - admin vidi sve, user samo svoje (ako su vezane za user_id)
            // Pretpostavljam da kategorije mogu biti globalne ili vezane za korisnika
            const userCategories = isAdmin ? allCategories : allCategories.filter(category => 
                !category.user_id || category.user_id === currentUser.id
            );
            setCategories(userCategories);
            
            return userCategories;
        } catch (err) {
            console.error('Error loading categories:', err);
            throw err;
        }
    };

    const loadTransactions = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };

            const response = await axios.get('/api/transactions', { params });
            let allTransactions = response.data.data || response.data;
            
            // Filtriraj transakcije na frontend-u ako API ne podržava filtriranje po korisniku
            if (!isAdmin && Array.isArray(allTransactions)) {
                const userAccountIds = accounts.map(account => account.id);
                allTransactions = allTransactions.filter(transaction => 
                    userAccountIds.includes(transaction.account_id)
                );
            }
            
            // Laravel pagination response structure
            if (response.data.data) {
                setTransactions(allTransactions);
                setCurrentPage(response.data.current_page || currentPage);
                setTotalPages(response.data.last_page || Math.ceil(allTransactions.length / perPage));
                setTotal(isAdmin ? response.data.total : allTransactions.length);
            } else {
                setTransactions(allTransactions);
                setTotalPages(Math.ceil(allTransactions.length / perPage));
                setTotal(allTransactions.length);
            }
        } catch (err) {
            setError('Failed to load transactions');
            console.error('Error loading transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setCurrentPage(1); // Reset na prvu stranicu kada se menjaju filteri
    };

    const clearFilters = () => {
        setFilters({
            min_amount: '',
            max_amount: '',
            date_from: '',
            date_to: '',
            account_id: '',
            category_id: ''
        });
        setCurrentPage(1);
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        
        if (!newTransaction.account_id || !newTransaction.category_id || !newTransaction.amount) {
            setError('Please fill in all required fields');
            return;
        }

        // Proveri da li korisnik pokušava da doda transakciju na račun koji nije njegov
        if (!isAdmin) {
            const selectedAccount = accounts.find(acc => acc.id == newTransaction.account_id);
            if (!selectedAccount || selectedAccount.user_id !== currentUser.id) {
                setError('You can only add transactions to your own accounts');
                return;
            }
        }

        try {
            await axios.post('/api/transactions', newTransaction);
            setNewTransaction({
                account_id: '',
                category_id: '',
                amount: '',
                transaction_date: new Date().toISOString().split('T')[0]
            });
            setError('');
            loadTransactions(); // Refresh lista
        } catch (err) {
            setError('Failed to add transaction');
            console.error('Error adding transaction:', err);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        
        // Dodatna provetra - da li korisnik može da briše ovu transakciju
        if (!isAdmin) {
            const transaction = transactions.find(t => t.id === id);
            if (transaction) {
                const transactionAccount = accounts.find(acc => acc.id === transaction.account_id);
                if (!transactionAccount || transactionAccount.user_id !== currentUser.id) {
                    setError('You can only delete your own transactions');
                    return;
                }
            }
        }
        
        try {
            await axios.delete(`/api/transactions/${id}`);
            loadTransactions();
        } catch (err) {
            setError('Failed to delete transaction');
            console.error('Error deleting transaction:', err);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ margin: '0 2px' }}
                >
                    {i}
                </button>
            );
        }

        return (
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                >
                    Previous
                </button>
                
                <span style={{ margin: '0 10px' }}>
                    {pages}
                </span>
                
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                >
                    Next
                </button>
                
                <div style={{ marginTop: '10px' }}>
                    Page {currentPage} of {totalPages} ({total} total transactions)
                </div>
            </div>
        );
    };

    if (!dataLoaded) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>
                    {isAdmin ? 'All Transactions (Admin View)' : 'My Transactions'}
                </h1>
                {isAdmin && (
                    <div style={{ 
                        backgroundColor: '#fff3cd', 
                        padding: '8px 12px', 
                        borderRadius: '4px',
                        border: '1px solid #ffeaa7',
                        color: '#856404'
                    }}>
                        👑 Admin Mode: You can see all users' data
                    </div>
                )}
            </div>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* Show user's accounts summary */}
            {!isAdmin && (
                <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Your Accounts Summary</h3>
                    {accounts.length === 0 ? (
                        <p>You don't have any accounts yet. Create an account first to add transactions.</p>
                    ) : (
                        <div>
                            <p>You have {accounts.length} account{accounts.length !== 1 ? 's' : ''}:</p>
                            <ul>
                                {accounts.map(account => (
                                    <li key={account.id}>{account.name} - Balance: ${parseFloat(account.balance || 0).toFixed(2)}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Show message if user has no transactions */}
            {!loading && transactions.length === 0 && Object.values(filters).every(f => f === '') && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                    <h3>No Transactions Found</h3>
                    <p>You don't have any transactions yet. Add your first transaction below!</p>
                </div>
            )}

            {/* Filters Section - Only show if user has accounts */}
            {accounts.length > 0 && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Filters</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        <InputField
                            label="Min Amount"
                            type="number"
                            value={filters.min_amount}
                            onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                            placeholder="0"
                        />
                        
                        <InputField
                            label="Max Amount"
                            type="number"
                            value={filters.max_amount}
                            onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                            placeholder="1000"
                        />
                        
                        <InputField
                            label="Date From"
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        />
                        
                        <InputField
                            label="Date To"
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        />
                        
                        <div>
                            <label>Account</label>
                            <select
                                value={filters.account_id}
                                onChange={(e) => handleFilterChange('account_id', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="">All Accounts</option>
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label>Category</label>
                            <select
                                value={filters.category_id}
                                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '15px' }}>
                        <CustomButton
                            label="Clear Filters"
                            onClick={clearFilters}
                            styleType="secondary"
                        />
                    </div>
                </div>
            )}

            {/* Add New Transaction Form - Only show if user has accounts */}
            {accounts.length > 0 && (
                <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Add New Transaction</h3>
                    <form onSubmit={handleAddTransaction}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                                <label>Account *</label>
                                <select
                                    required
                                    value={newTransaction.account_id}
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, account_id: e.target.value }))}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label>Category *</label>
                                <select
                                    required
                                    value={newTransaction.category_id}
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category_id: e.target.value }))}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} ({category.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <InputField
                                label="Amount *"
                                type="number"
                                step="0.01"
                                required
                                value={newTransaction.amount}
                                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="0.00"
                            />
                            
                            <InputField
                                label="Date *"
                                type="date"
                                required
                                value={newTransaction.transaction_date}
                                onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_date: e.target.value }))}
                            />
                        </div>
                        
                        <div style={{ marginTop: '15px' }}>
                            <CustomButton
                                label="Add Transaction"
                                type="submit"
                                styleType="primary"
                            />
                        </div>
                    </form>
                </div>
            )}

            {/* Per Page Selector */}
            {transactions.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <label>
                        Show 
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ margin: '0 5px', padding: '4px' }}
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        transactions per page
                    </label>
                </div>
            )}

            {/* Transactions List */}
            {loading ? (
                <div>Loading transactions...</div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Account</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>
                                            {Object.values(filters).some(f => f !== '') ? 
                                                'No transactions match your filters' : 
                                                'No transactions found'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(transaction => (
                                        <tr key={transaction.id}>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                {transaction.transaction_date}
                                            </td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                {accounts.find(acc => acc.id === transaction.account_id)?.name || 'Unknown'}
                                            </td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                {categories.find(cat => cat.id === transaction.category_id)?.name || 'Unknown'}
                                            </td>
                                            <td style={{ 
                                                padding: '10px', 
                                                border: '1px solid #ddd',
                                                color: parseFloat(transaction.amount) >= 0 ? 'green' : 'red',
                                                fontWeight: 'bold'
                                            }}>
                                                ${parseFloat(transaction.amount).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                <CustomButton
                                                    label="Delete"
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                    styleType="danger"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {renderPagination()}
                </>
            )}
        </div>
    );
}