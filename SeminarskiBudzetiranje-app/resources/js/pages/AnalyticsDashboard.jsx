import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import { getCurrentUser, hasRole } from '../components/ProtectedRoute';

// Google Charts loader
const loadGoogleCharts = () => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.charts) {
            resolve(window.google);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
            window.google.charts.load('current', { packages: ['corechart', 'line', 'bar'] });
            window.google.charts.setOnLoadCallback(() => resolve(window.google));
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

export default function AnalyticsDashboard() {
    const currentUser = getCurrentUser();
    const isAdmin = hasRole('admin');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartsLoaded, setChartsLoaded] = useState(false);
    
    // Analytics data
    const [financialOverview, setFinancialOverview] = useState(null);
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [categoryAnalysis, setCategoryAnalysis] = useState([]);
    const [auditLog, setAuditLog] = useState([]);

    // Batch update state
    const [batchTransactions, setBatchTransactions] = useState([]);
    const [batchLoading, setBatchLoading] = useState(false);

    useEffect(() => {
        initializeCharts();
        loadAnalyticsData();
    }, []);

    const initializeCharts = async () => {
        try {
            await loadGoogleCharts();
            setChartsLoaded(true);
        } catch (err) {
            console.error('Failed to load Google Charts:', err);
            setError('Failed to load chart library');
        }
    };

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            // Paralelno učitavanje svih analytics podataka
            const [overviewRes, trendsRes, categoryRes, auditRes] = await Promise.all([
                axios.get('/api/analytics/financial-overview'),
                axios.get('/api/analytics/monthly-trends?months=12'),
                axios.get('/api/analytics/category-analysis'),
                axios.get('/api/analytics/audit-log?per_page=10')
            ]);

            setFinancialOverview(overviewRes.data);
            setMonthlyTrends(trendsRes.data.trends || []);
            setCategoryAnalysis(categoryRes.data.analysis || []);
            setAuditLog(auditRes.data.data || []);

        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Analytics loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    const drawMonthlyTrendsChart = () => {
        if (!chartsLoaded || !monthlyTrends.length) return;

        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Month');
        data.addColumn('number', 'Income');
        data.addColumn('number', 'Expenses');
        data.addColumn('number', 'Net Income');

        const rows = monthlyTrends.map(trend => [
            trend.month_name,
            parseFloat(trend.total_income),
            parseFloat(trend.total_expenses) * -1, // Negative for visualization
            parseFloat(trend.total_income) - parseFloat(trend.total_expenses)
        ]);

        data.addRows(rows);

        const options = {
            title: 'Monthly Financial Trends (Last 12 Months)',
            titleTextStyle: { fontSize: 18, bold: true },
            hAxis: {
                title: 'Month',
                titleTextStyle: { fontSize: 14 }
            },
            vAxis: {
                title: 'Amount ($)',
                titleTextStyle: { fontSize: 14 }
            },
            series: {
                0: { color: '#4CAF50', type: 'columns' },
                1: { color: '#F44336', type: 'columns' },
                2: { color: '#2196F3', type: 'line', lineWidth: 3 }
            },
            legend: { position: 'top', alignment: 'center' },
            backgroundColor: 'white',
            chartArea: { width: '80%', height: '70%' },
            width: '100%',
            height: 400
        };

        const chart = new window.google.visualization.ComboChart(
            document.getElementById('monthly-trends-chart')
        );
        chart.draw(data, options);
    };

    const drawCategoryPieChart = () => {
        if (!chartsLoaded || !categoryAnalysis.length) return;

        // Filtriraj samo expense kategorije za pie chart
        const expenseCategories = categoryAnalysis.filter(cat => 
            cat.type === 'expense' && parseFloat(cat.total_amount) > 0
        );

        if (!expenseCategories.length) return;

        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Category');
        data.addColumn('number', 'Amount');

        const rows = expenseCategories.slice(0, 8).map(cat => [
            cat.name,
            parseFloat(cat.total_amount)
        ]);

        data.addRows(rows);

        const options = {
            title: 'Expense Distribution by Category',
            titleTextStyle: { fontSize: 18, bold: true },
            pieHole: 0.4,
            colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'],
            backgroundColor: 'white',
            legend: { position: 'right', alignment: 'center' },
            chartArea: { width: '80%', height: '80%' },
            width: '100%',
            height: 350
        };

        const chart = new window.google.visualization.PieChart(
            document.getElementById('category-pie-chart')
        );
        chart.draw(data, options);
    };

    const drawTransactionFrequencyChart = () => {
        if (!chartsLoaded || !monthlyTrends.length) return;

        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Month');
        data.addColumn('number', 'Transaction Count');

        const rows = monthlyTrends.map(trend => [
            trend.month_name,
            parseInt(trend.transaction_count)
        ]);

        data.addRows(rows);

        const options = {
            title: 'Transaction Frequency Over Time',
            titleTextStyle: { fontSize: 18, bold: true },
            hAxis: {
                title: 'Month',
                titleTextStyle: { fontSize: 14 }
            },
            vAxis: {
                title: 'Number of Transactions',
                titleTextStyle: { fontSize: 14 }
            },
            colors: ['#9C27B0'],
            backgroundColor: 'white',
            legend: { position: 'none' },
            chartArea: { width: '80%', height: '70%' },
            width: '100%',
            height: 300
        };

        const chart = new window.google.visualization.AreaChart(
            document.getElementById('frequency-chart')
        );
        chart.draw(data, options);
    };

    // Effect za crtanje chart-ova kada se podaci učitaju
    useEffect(() => {
        if (chartsLoaded && monthlyTrends.length > 0) {
            // Dodaj malu pauzu da se DOM elementi učitaju
            setTimeout(() => {
                drawMonthlyTrendsChart();
                drawTransactionFrequencyChart();
            }, 100);
        }
    }, [chartsLoaded, monthlyTrends]);

    useEffect(() => {
        if (chartsLoaded && categoryAnalysis.length > 0) {
            setTimeout(() => {
                drawCategoryPieChart();
            }, 100);
        }
    }, [chartsLoaded, categoryAnalysis]);

    const handleBatchUpdate = async () => {
        if (!batchTransactions.length) {
            setError('No transactions selected for batch update');
            return;
        }

        setBatchLoading(true);
        try {
            await axios.post('/api/analytics/batch-transaction-update', {
                transactions: batchTransactions
            });

            alert('Batch update completed successfully!');
            setBatchTransactions([]);
            loadAnalyticsData(); // Reload data

        } catch (err) {
            setError('Batch update failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setBatchLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Loading Analytics Dashboard...</h2>
                <p>Please wait while we load your financial analytics...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2d3e50' }}>
                    📊 Financial Analytics Dashboard
                </h1>
                {isAdmin && (
                    <div style={{ 
                        backgroundColor: '#fff3cd', 
                        padding: '8px 12px', 
                        borderRadius: '4px',
                        border: '1px solid #ffeaa7',
                        color: '#856404'
                    }}>
                        👑 Admin View: System-wide Analytics
                    </div>
                )}
            </div>

            {error && (
                <div style={{ 
                    color: 'red', 
                    marginBottom: '20px', 
                    padding: '15px', 
                    border: '1px solid red', 
                    borderRadius: '4px',
                    backgroundColor: '#ffebee'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Financial Overview Cards */}
            {financialOverview && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '15px' }}>Financial Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        {financialOverview.data.map((overview, index) => (
                            <div key={index} style={{ 
                                backgroundColor: 'white', 
                                padding: '20px', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <h3 style={{ color: '#2196F3', marginBottom: '10px' }}>{overview.name}</h3>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    <p><strong>Total Balance:</strong> ${parseFloat(overview.total_balance || 0).toFixed(2)}</p>
                                    <p><strong>Accounts:</strong> {overview.total_accounts}</p>
                                    <p><strong>Transactions:</strong> {overview.total_transactions}</p>
                                    <p><strong>Q. Income:</strong> ${parseFloat(overview.quarterly_income || 0).toFixed(2)}</p>
                                    <p><strong>Q. Expenses:</strong> ${parseFloat(overview.quarterly_expenses || 0).toFixed(2)}</p>
                                    <p><strong>Top Category:</strong> {overview.most_used_category || 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart Section */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '20px' }}>Visual Analytics</h2>
                
                {/* Monthly Trends Chart */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    {monthlyTrends.length > 0 ? (
                        <div id="monthly-trends-chart" style={{ width: '100%', height: '400px' }}></div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#666', padding: '50px' }}>
                            No data available for monthly trends chart
                        </p>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Category Distribution Pie Chart */}
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {categoryAnalysis.length > 0 ? (
                            <div id="category-pie-chart" style={{ width: '100%', height: '350px' }}></div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666', padding: '50px' }}>
                                No category data available
                            </p>
                        )}
                    </div>

                    {/* Transaction Frequency Chart */}
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {monthlyTrends.length > 0 ? (
                            <div id="frequency-chart" style={{ width: '100%', height: '300px' }}></div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666', padding: '50px' }}>
                                No frequency data available
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Analysis Table */}
            {categoryAnalysis.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '15px' }}>Category Performance Analysis</h2>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflowX: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Type</th>
                                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Total Amount</th>
                                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Transactions</th>
                                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Avg Amount</th>
                                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>% of Type</th>
                                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryAnalysis.slice(0, 15).map((category, index) => (
                                    <tr key={index} style={{ 
                                        backgroundColor: category.type === 'income' ? '#e8f5e8' : '#ffeaea' 
                                    }}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {category.name}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <span style={{ 
                                                padding: '3px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: category.type === 'income' ? '#4caf50' : '#f44336',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {category.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                                            ${parseFloat(category.total_amount || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                                            {category.transaction_count}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                                            ${parseFloat(category.avg_amount || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                                            {parseFloat(category.percentage_of_type || 0).toFixed(1)}%
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                            #{category.amount_rank}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Batch Transaction Update Section */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '15px' }}>🔄 Batch Transaction Operations</h2>
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Select transactions to update in batch. This demonstrates database transactions with rollback capabilities.
                    </p>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <CustomButton
                            label="Load Sample Transactions for Batch Update"
                            onClick={async () => {
                                try {
                                    const response = await axios.get('/api/transactions?per_page=5');
                                    const transactions = response.data.data || response.data;
                                    setBatchTransactions(transactions.slice(0, 3).map(t => ({
                                        id: t.id,
                                        amount: parseFloat(t.amount) + 10 // Add $10 to each
                                    })));
                                } catch (err) {
                                    setError('Failed to load transactions for batch update');
                                }
                            }}
                            styleType="secondary"
                        />
                    </div>

                    {batchTransactions.length > 0 && (
                        <div>
                            <h4>Transactions to Update:</h4>
                            <ul style={{ marginBottom: '15px' }}>
                                {batchTransactions.map((trans, index) => (
                                    <li key={index}>
                                        Transaction #{trans.id} - New Amount: ${trans.amount.toFixed(2)}
                                    </li>
                                ))}
                            </ul>

                            <CustomButton
                                label={batchLoading ? "Processing..." : "Execute Batch Update"}
                                onClick={handleBatchUpdate}
                                disabled={batchLoading}
                                styleType="primary"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Audit Log */}
            {auditLog.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '15px' }}>📋 Recent Activity (Audit Log)</h2>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflowX: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Action</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Transaction</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Old Amount</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>New Amount</th>
                                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Changed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLog.slice(0, 10).map((log, index) => (
                                    <tr key={index}>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '12px' }}>
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                            <span style={{ 
                                                padding: '2px 6px', 
                                                borderRadius: '8px',
                                                backgroundColor: log.action === 'INSERT' ? '#4caf50' : 
                                                                log.action === 'UPDATE' ? '#ff9800' : '#f44336',
                                                color: 'white',
                                                fontSize: '10px'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                            #{log.transaction_id}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                            {log.old_amount ? `${parseFloat(log.old_amount).toFixed(2)}` : '-'}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                            {log.new_amount ? `${parseFloat(log.new_amount).toFixed(2)}` : '-'}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                            {log.changed_by_name || 'System'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Refresh Data Button */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <CustomButton
                    label="🔄 Refresh Analytics Data"
                    onClick={loadAnalyticsData}
                    disabled={loading}
                    styleType="primary"
                />
            </div>
        </div>
    );
}