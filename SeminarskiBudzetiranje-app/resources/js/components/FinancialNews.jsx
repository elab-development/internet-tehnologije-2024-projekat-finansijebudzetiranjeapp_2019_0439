import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from './CustomButton';

const FinancialNews = ({ compact = false }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('business');

    const categories = {
        'business': { label: 'Business', icon: '💼', color: '#007bff' },
        'technology': { label: 'Technology', icon: '💻', color: '#6f42c1' },
        'general': { label: 'General', icon: '📰', color: '#28a745' }
    };

    useEffect(() => {
        fetchNews();
    }, [selectedCategory]);

    const fetchNews = async () => {
        setLoading(true);
        setError('');

        try {
            // Koristimo NewsAPI.org (potreban je API key, ali možemo koristiti mock podatke)
            // const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=${selectedCategory}&country=us&apiKey=YOUR_API_KEY`);
            
            // Mock podaci za demo (u produkciji koristiti pravi API)
            // NOVI URL sa tvojim API ključem
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=${selectedCategory}&country=us&pageSize=10&apiKey=44b80aee5f8c447d9f24222410ad246b`);
        
        if (response.data && response.data.articles) {
            // Filtruj artikle koji imaju sve potrebne podatke
            const validArticles = response.data.articles.filter(article => 
                article.title && 
                article.description && 
                article.urlToImage && 
                article.source.name
            );
            
            setNews(validArticles);
        } else {
            throw new Error('Invalid API response');
        }
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('Failed to fetch financial news. Please try again later.');
            const mockNews = [
                {
                    id: 1,
                    title: "Federal Reserve Announces New Interest Rate Decision",
                    description: "The Federal Reserve has decided to maintain current interest rates, signaling a cautious approach to monetary policy amid economic uncertainty.",
                    url: "#",
                    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
                    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    source: { name: "Financial Times" },
                    category: "monetary-policy",
                    relevance: "high"
                },
                {
                    id: 2,
                    title: "Consumer Price Index Shows Inflation Trends",
                    description: "Latest CPI data reveals important trends in consumer prices, affecting household budgeting and spending patterns across various sectors.",
                    url: "#",
                    urlToImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
                    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    source: { name: "Reuters" },
                    category: "inflation",
                    relevance: "high"
                },
                {
                    id: 3,
                    title: "Digital Banking Trends Transform Personal Finance",
                    description: "New fintech solutions are making personal budgeting and financial management more accessible to consumers worldwide.",
                    url: "#",
                    urlToImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop",
                    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                    source: { name: "TechCrunch" },
                    category: "fintech",
                    relevance: "medium"
                },
                {
                    id: 4,
                    title: "Housing Market Update: Impact on Personal Budgets",
                    description: "Recent changes in housing costs are significantly affecting how families plan their monthly budgets and long-term financial goals.",
                    url: "#",
                    urlToImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop",
                    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                    source: { name: "Wall Street Journal" },
                    category: "housing",
                    relevance: "high"
                },
                {
                    id: 5,
                    title: "Investment Apps Make Portfolio Management Easier",
                    description: "New mobile applications are simplifying investment tracking and portfolio management for retail investors and budget-conscious savers.",
                    url: "#",
                    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
                    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
                    source: { name: "Bloomberg" },
                    category: "investment",
                    relevance: "medium"
                },
                {
                    id: 6,
                    title: "Energy Prices Affect Household Expenses",
                    description: "Fluctuating energy costs continue to impact family budgets, with experts providing tips for managing utility expenses effectively.",
                    url: "#",
                    urlToImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop",
                    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
                    source: { name: "CNBC" },
                    category: "energy",
                    relevance: "high"
                }
            ];

            setNews(mockNews);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const publishedDate = new Date(dateString);
        const diffInHours = Math.floor((now - publishedDate) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const getRelevanceBadge = (relevance) => {
        const badges = {
            'high': { color: '#dc3545', text: '🔥 Hot' },
            'medium': { color: '#ffc107', text: '📈 Trending' },
            'low': { color: '#28a745', text: '💡 Info' }
        };
        return badges[relevance] || badges.low;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'monetary-policy': '🏦',
            'inflation': '📊',
            'fintech': '💻',
            'housing': '🏠',
            'investment': '💰',
            'energy': '⚡',
            'default': '📰'
        };
        return icons[category] || icons.default;
    };

    // Kompaktna verzija za sidebar
    if (compact) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2d3e50', fontSize: '16px' }}>
                    📰 Financial News
                </h4>
                
                {loading ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>Loading news...</p>
                ) : error ? (
                    <p style={{ color: '#dc3545', fontSize: '12px' }}>{error}</p>
                ) : (
                    <div>
                        {news.slice(0, 3).map(article => (
                            <div key={article.id} style={{
                                padding: '8px 0',
                                borderBottom: '1px solid #f0f0f0',
                                fontSize: '13px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '8px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            fontWeight: 'bold', 
                                            marginBottom: '4px',
                                            lineHeight: '1.2',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {getCategoryIcon(article.category)} {article.title}
                                        </div>
                                        <div style={{ 
                                            color: '#666', 
                                            fontSize: '11px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span>{article.source.name}</span>
                                            <span>{formatTimeAgo(article.publishedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <button
                                onClick={fetchNews}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    textDecoration: 'underline'
                                }}
                            >
                                Refresh News
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Puna verzija
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
                    📰 Financial News & Updates
                </h3>
                <CustomButton
                    label={loading ? "Loading..." : "Refresh"}
                    onClick={fetchNews}
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

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {Object.entries(categories).map(([key, cat]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selectedCategory === key ? 'none' : '1px solid #ddd',
                            backgroundColor: selectedCategory === key ? cat.color : 'white',
                            color: selectedCategory === key ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.3s'
                        }}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📰</div>
                    <p>Loading financial news...</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px'
                }}>
                    {news.map(article => {
                        const relevanceBadge = getRelevanceBadge(article.relevance);
                        return (
                            <div key={article.id} style={{
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                                {/* Article Image */}
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        style={{
                                            width: '100%',
                                            height: '180px',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=180&fit=crop';
                                        }}
                                    />
                                    
                                    {/* Relevance Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: relevanceBadge.color,
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        {relevanceBadge.text}
                                    </div>
                                    
                                    {/* Category Icon */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '6px',
                                        borderRadius: '50%',
                                        fontSize: '16px'
                                    }}>
                                        {getCategoryIcon(article.category)}
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div style={{ padding: '15px' }}>
                                    <h4 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '16px',
                                        lineHeight: '1.3',
                                        color: '#2d3e50',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {article.title}
                                    </h4>

                                    <p style={{
                                        margin: '0 0 15px 0',
                                        color: '#666',
                                        fontSize: '14px',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {article.description}
                                    </p>

                                    {/* Article Meta */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        color: '#999',
                                        paddingTop: '10px',
                                        borderTop: '1px solid #f0f0f0'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>
                                            📰 {article.source.name}
                                        </span>
                                        <span>
                                            🕐 {formatTimeAgo(article.publishedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Budgeting Tips Section */}
            <div style={{
                marginTop: '30px',
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2d3e50' }}>
                    💡 How Financial News Affects Your Budget
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '15px'
                }}>
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
                        <strong>📊 Inflation News:</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            Monitor price trends to adjust your monthly budget categories accordingly.
                        </p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
                        <strong>🏦 Interest Rates:</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            Changes affect loans, savings rates, and investment returns.
                        </p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
                        <strong>⚡ Energy Prices:</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            Plan utility budget adjustments based on seasonal trends.
                        </p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
                        <strong>🏠 Housing Market:</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            Impacts rent, mortgage rates, and property investments.
                        </p>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#1976d2',
                textAlign: 'center'
            }}>
                📍 News data is for informational purposes only. Always consult financial advisors for investment decisions.
            </div>
        </div>
    );
};

export default FinancialNews;