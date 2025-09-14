import React, { useState } from 'react';
import CurrencyRates from '../components/CurrencyRates';
import FinancialNews from '../components/FinancialNews';
import CustomButton from '../components/CustomButton';
import { getCurrentUser, hasRole } from '../components/ProtectedRoute';

export default function MarketData() {
    const currentUser = getCurrentUser();
    const isAdmin = hasRole('admin');
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'currencies', label: 'Currency Rates', icon: '💱' },
        { id: 'news', label: 'Financial News', icon: '📰' },
        { id: 'tools', label: 'Budget Tools', icon: '🧮' }
    ];

    const renderBudgetTools = () => (
        <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
        }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2d3e50' }}>
                🧮 Budget Planning Tools
            </h3>

            {/* Inflation Calculator */}
            <div style={{
                backgroundColor: '#fff3e0',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffcc80'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#e65100' }}>
                    📈 Inflation Impact Calculator
                </h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                    Calculate how inflation affects your budget over time.
                </p>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Current Monthly Budget ($)
                        </label>
                        <input
                            type="number"
                            placeholder="3000"
                            id="currentBudget"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Annual Inflation Rate (%)
                        </label>
                        <input
                            type="number"
                            placeholder="3.5"
                            step="0.1"
                            id="inflationRate"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Years Ahead
                        </label>
                        <select
                            id="yearsAhead"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="1">1 Year</option>
                            <option value="2">2 Years</option>
                            <option value="3">3 Years</option>
                            <option value="5">5 Years</option>
                            <option value="10">10 Years</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end' }}>
                        <CustomButton
                            label="Calculate Impact"
                            onClick={() => {
                                const currentBudget = parseFloat(document.getElementById('currentBudget').value) || 3000;
                                const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 3.5;
                                const years = parseInt(document.getElementById('yearsAhead').value) || 1;
                                
                                const futureBudget = currentBudget * Math.pow(1 + inflationRate/100, years);
                                const difference = futureBudget - currentBudget;
                                
                                alert(`In ${years} year(s):\n` +
                                      `Current budget: $${currentBudget.toFixed(2)}\n` +
                                      `Future equivalent: $${futureBudget.toFixed(2)}\n` +
                                      `Additional needed: $${difference.toFixed(2)} (+${((difference/currentBudget)*100).toFixed(1)}%)`);
                            }}
                            styleType="primary"
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Fund Calculator */}
            <div style={{
                backgroundColor: '#e3f2fd',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #90caf9'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1565c0' }}>
                    🛡️ Emergency Fund Calculator
                </h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                    Calculate your recommended emergency fund based on monthly expenses.
                </p>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Monthly Expenses ($)
                        </label>
                        <input
                            type="number"
                            placeholder="2500"
                            id="monthlyExpenses"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Job Security Level
                        </label>
                        <select
                            id="jobSecurity"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="3">Stable Job (3 months)</option>
                            <option value="6">Average Security (6 months)</option>
                            <option value="9">Uncertain Job (9 months)</option>
                            <option value="12">High Risk (12 months)</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end' }}>
                        <CustomButton
                            label="Calculate Fund"
                            onClick={() => {
                                const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 2500;
                                const months = parseInt(document.getElementById('jobSecurity').value) || 6;
                                
                                const emergencyFund = monthlyExpenses * months;
                                const monthlyContribution = emergencyFund / 12; // If saved over 1 year
                                
                                alert(`Emergency Fund Recommendation:\n` +
                                      `Total needed: $${emergencyFund.toFixed(2)}\n` +
                                      `Monthly contribution: $${monthlyContribution.toFixed(2)}\n` +
                                      `This covers ${months} months of expenses`);
                            }}
                            styleType="primary"
                        />
                    </div>
                </div>
            </div>

            {/* Budget Allocation Guide */}
            <div style={{
                backgroundColor: '#e8f5e8',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #a5d6a7'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>
                    💰 50/30/20 Budget Rule Calculator
                </h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                    Break down your income using the popular 50/30/20 budgeting rule.
                </p>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Monthly After-Tax Income ($)
                        </label>
                        <input
                            type="number"
                            placeholder="4000"
                            id="monthlyIncome"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end' }}>
                        <CustomButton
                            label="Calculate Breakdown"
                            onClick={() => {
                                const income = parseFloat(document.getElementById('monthlyIncome').value) || 4000;
                                
                                const needs = income * 0.5;
                                const wants = income * 0.3;
                                const savings = income * 0.2;
                                
                                alert(`50/30/20 Budget Breakdown:\n\n` +
                                      `💳 Needs (50%): $${needs.toFixed(2)}\n` +
                                      `   (Housing, food, utilities, transport)\n\n` +
                                      `🎯 Wants (30%): $${wants.toFixed(2)}\n` +
                                      `   (Entertainment, hobbies, dining out)\n\n` +
                                      `💰 Savings (20%): $${savings.toFixed(2)}\n` +
                                      `   (Emergency fund, investments, debt repayment)`);
                            }}
                            styleType="primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ color: '#2d3e50' }}>
                        📈 Market Data & Financial Tools
                    </h1>
                    {isAdmin && (
                        <div style={{ 
                            backgroundColor: '#fff3cd', 
                            padding: '8px 12px', 
                            borderRadius: '4px',
                            border: '1px solid #ffeaa7',
                            color: '#856404'
                        }}>
                            👑 Admin View
                        </div>
                    )}
                </div>

                <p style={{ color: '#666', fontSize: '16px' }}>
                    Stay informed with real-time market data and use our budgeting tools to make smarter financial decisions.
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '4px',
                marginBottom: '30px',
                overflowX: 'auto',
                gap: '4px'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div>
                    {/* Overview Dashboard */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div>
                            <CurrencyRates />
                        </div>
                        <div>
                            <FinancialNews compact={true} />
                            
                            {/* Quick Stats */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '15px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#2d3e50', fontSize: '16px' }}>
                                    📊 Quick Market Stats
                                </h4>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>📈 Market Trend:</span>
                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>Stable</span>
                                    </div>
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>💰 USD Strength:</span>
                                        <span style={{ color: '#007bff', fontWeight: 'bold' }}>Strong</span>
                                    </div>
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>⚡ Volatility:</span>
                                        <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Moderate</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>🏦 Interest Rates:</span>
                                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Rising</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'currencies' && <CurrencyRates />}
            {activeTab === 'news' && <FinancialNews />}
            {activeTab === 'tools' && renderBudgetTools()}
        </div>
    );
}