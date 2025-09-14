import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Uzmi token i email iz URL parametara
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        email: email || '',
        token: token || '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        // Ako nema token-a ili email-a, preusmeri na login
        if (!token || !email) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('/api/password/reset', {
                email: formData.email,
                token: formData.token,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });

            setMessage('Password has been reset successfully! Redirecting to login...');
            
            // Preusmeri na login posle 2 sekunde
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError('Password reset failed. The link may be expired or invalid.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                padding: '40px',
                width: '100%',
                maxWidth: '400px'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '28px' }}>
                        Reset Password
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        Enter your new password below
                    </p>
                </div>

                {/* Messages */}
                {message && (
                    <div style={{ 
                        color: '#4caf50', 
                        backgroundColor: '#e8f5e8',
                        padding: '12px', 
                        borderRadius: '6px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{ 
                        color: '#f44336', 
                        backgroundColor: '#ffeaea',
                        padding: '12px', 
                        borderRadius: '6px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Reset Form */}
                {!message && token && email && (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: '#f8f9fa',
                                    fontSize: '14px',
                                    color: '#666'
                                }}
                            />
                        </div>
                        
                        <InputField
                            label="New Password"
                            type="password"
                            placeholder="Enter your new password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        />
                        
                        <InputField
                            label="Confirm New Password"
                            type="password"
                            placeholder="Confirm your new password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <CustomButton
                                label={loading ? "Resetting..." : "Reset Password"}
                                type="submit"
                                styleType="primary"
                                disabled={loading}
                            />
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}