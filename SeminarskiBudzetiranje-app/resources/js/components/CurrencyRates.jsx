import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from './CustomButton';

const CurrencyRates = ({ showInSidebar = false }) => {
    const [rates, setRates] = useState({});
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [selectedCurrencies, setSelectedCurrencies] = useState(['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'RSD']);

    // Popularne valute sa flagama
    const currencyInfo = {
        'USD': { name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
        'EUR': { name: 'Euro', flag: '🇪🇺', symbol: '€' },
        'GBP': { name: 'British Pound', flag: '🇬🇧', symbol: '£' },
        'JPY': { name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
        'CAD': { name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
        'AUD': { name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
        'CHF': { name: 'Swiss Franc', flag: '🇨🇭', symbol: 'Fr' },
        'CNY': { name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
        'RSD': { name: 'Serbian Dinar', flag: '🇷🇸', symbol: 'RSD' },
        'SEK': { name: 'Swedish Krona', flag: '🇸🇪', symbol: 'kr' },
        'NOK': { name: 'Norwegian Krone', flag: '🇳🇴', symbol: 'kr' },
        'DKK': { name: 'Danish Krone', flag: '🇩🇰', symbol: 'kr' },
        'PLN': { name: 'Polish Zloty', flag: '🇵🇱', symbol: 'zł' },
        'CZK': { name: 'Czech Koruna', flag: '🇨🇿', symbol: 'Kč' },
        'HUF': { name: 'Hungarian Forint', flag: '🇭🇺', symbol: 'Ft' },
        'RON': { name: 'Romanian Leu', flag: '🇷🇴', symbol: 'lei' },
        'BGN': { name: 'Bulgarian Lev', flag: '🇧🇬', symbol: 'лв' },
        'HRK': { name: 'Croatian Kuna', flag: '🇭🇷', symbol: 'kn' },
        'TRY': { name: 'Turkish Lira', flag: '🇹🇷', symbol: '₺' },
        'RUB': { name: 'Russian Ruble', flag: '🇷🇺', symbol: '₽' }
    };

    useEffect(() => {
        fetchExchangeRates();
        // Osvežavaj svaka 2 sata (API se ograničava na broj poziva)
        const interval = setInterval(fetchExchangeRates, 2 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [baseCurrency]);

    const fetchExchangeRates = async () => {
        setLoading(true);
        setError('');

        try {
            // Koristimo besplatni ExchangeRate-API
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
            
            if (response.data && response.data.rates) {
                setRates(response.data.rates);
                setLastUpdated(new Date(response.data.date).toLocaleDateString('sr-RS', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }));
            } else {
                throw new Error('Invalid API response');
            }
        } catch (err) {
            console.error('Error fetching exchange rates:', err);
            setError('Failed to fetch exchange rates. Please try again later.');
            
            // Fallback - mock podaci za demo
            setRates({
                'EUR': 0.85,
                'GBP': 0.73,
                'JPY': 110.12,
                'CAD': 1.25,
                'AUD': 1.35,
                'CHF': 0.92,
                'CNY': 6.45,
                'RSD': 107.50
            });
            setLastUpdated('Mock data - ' + new Date().toLocaleDateString('sr-RS'));
        } finally {
            setLoading(false);
        }
    };

    const calculateConversion = (amount, fromRate, toRate) => {
        if (fromRate && toRate) {
            return (amount / fromRate * toRate).toFixed(4);
        }
        return '0.0000';
    };

    const getChangeIndicator = (rate) => {
        // Simuliramo trend (u realnoj aplikaciji bi se čuvao prethodan dan)
        const randomChange = (Math.random() - 0.5) * 0.02; // ±1%
        if (randomChange > 0.005) return { text: '↗', color: '#28a745', change: '+' + (randomChange * 100).toFixed(2) + '%' };
        if (randomChange < -0.005) return { text: '↘', color: '#dc3545', change: (randomChange * 100).toFixed(2) + '%' };
        return { text: '→', color: '#6c757d', change: '0.00%' };
    };

    // Sidebar verzija - kompaktniji prikaz
    if (showInSidebar) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2d3e50', fontSize: '16px' }}>
                    💱 Exchange Rates
                </h4>
                
                {loading ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>Loading rates...</p>
                ) : error ? (
                    <p style={{ color: '#dc3545', fontSize: '12px' }}>{error}</p>
                ) : (
                    <div>
                        <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                            Base: <strong>{baseCurrency}</strong>
                        </div>
                        
                        {selectedCurrencies.slice(0, 5).map(currency => {
                            if (!rates[currency] || currency === baseCurrency) return null;
                            const trend = getChangeIndicator(rates[currency]);
                            return (
                                <div key={currency} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 0',
                                    borderBottom: '1px solid #f0f0f0',
                                    fontSize: '14px'
                                }}>
                                    <span>
                                        {currencyInfo[currency]?.flag} {currency}
                                    </span>
                                    <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {rates[currency].toFixed(4)}
                                        <span style={{ color: trend.color, fontSize: '12px' }}>
                                            {trend.text}
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                        
                        <div style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
                            Updated: {lastUpdated}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Puna verzija za glavnu stranicu
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#2d3e50' }}>
                    💱 Currency Exchange Rates
                </h3>
                <CustomButton
                    label={loading ? "Refreshing..." : "Refresh Rates"}
                    onClick={fetchExchangeRates}
                    styleType="secondary"
                    disabled={loading}
                />
            </div>

            {error && (
                <div style={{
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #f5c6cb'
                }}>
                    {error}
                </div>
            )}

            {/* Base Currency Selector */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Base Currency:
                </label>
                <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        minWidth: '150px'
                    }}
                >
                    {Object.keys(currencyInfo).map(code => (
                        <option key={code} value={code}>
                            {currencyInfo[code].flag} {code} - {currencyInfo[code].name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>💱</div>
                    <p>Loading exchange rates...</p>
                </div>
            ) : (
                <div>
                    {/* Exchange Rates Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '15px',
                        marginBottom: '25px'
                    }}>
                        {selectedCurrencies.map(currency => {
                            if (!rates[currency] || currency === baseCurrency) return null;
                            const trend = getChangeIndicator(rates[currency]);
                            const info = currencyInfo[currency];
                            
                            return (
                                <div key={currency} style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '15px',
                                    borderRadius: '6px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '20px' }}>{info?.flag}</span>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{currency}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{info?.name}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                {rates[currency].toFixed(4)}
                                            </div>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: trend.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '2px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                {trend.text} {trend.change}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        1 {baseCurrency} = {rates[currency].toFixed(4)} {currency}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        1 {currency} = {(1 / rates[currency]).toFixed(4)} {baseCurrency}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Converter */}
                    <div style={{
                        backgroundColor: '#e7f3ff',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #b3d7f0'
                    }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>🔄 Quick Currency Converter</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '10px',
                            alignItems: 'end'
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Amount</label>
                                <input
                                    type="number"
                                    placeholder="100"
                                    id="convertAmount"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>From</label>
                                <select id="fromCurrency" style={{ width: '100%', padding: '8px' }}>
                                    <option value={baseCurrency}>{baseCurrency}</option>
                                    {selectedCurrencies.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>To</label>
                                <select id="toCurrency" style={{ width: '100%', padding: '8px' }}>
                                    {selectedCurrencies.map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                            </div>
                            <CustomButton
                                label="Convert"
                                onClick={() => {
                                    const amount = parseFloat(document.getElementById('convertAmount').value) || 100;
                                    const from = document.getElementById('fromCurrency').value;
                                    const to = document.getElementById('toCurrency').value;
                                    
                                    const fromRate = from === baseCurrency ? 1 : rates[from];
                                    const toRate = to === baseCurrency ? 1 : rates[to];
                                    
                                    const result = calculateConversion(amount, fromRate, toRate);
                                    alert(`${amount} ${from} = ${result} ${to}`);
                                }}
                                styleType="primary"
                            />
                        </div>
                    </div>

                    {/* Last Updated Info */}
                    <div style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#666',
                        textAlign: 'center'
                    }}>
                        📅 Last updated: {lastUpdated} | Rates are indicative and may not reflect real-time market prices
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencyRates;