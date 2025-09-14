import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/transactions', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setTransactions(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Your Transactions</h1>
            <ul>
                {transactions.map(t => (
                    <li key={t.id}>{t.description} - {t.amount}</li>
                ))}
            </ul>
        </div>
    );
}