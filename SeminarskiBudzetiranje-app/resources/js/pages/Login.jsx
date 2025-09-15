import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';

export default function Login() {
    const [formMode, setFormMode] = useState('login'); // 'login', 'register', 'forgotPassword'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user'
    });

    // Forgot password state
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('/api/login', loginData);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Set default header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (registerData.password !== registerData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('/api/register', registerData);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                setMessage('Registration successful! Redirecting...');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.post('/api/password/forgot', { email: forgotPasswordEmail });
            setMessage('Password reset link has been sent to your email!');
            setForgotPasswordEmail('');
        } catch (err) {
            if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError('Failed to send reset link. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setLoginData({ email: '', password: '' });
        setRegisterData({ name: '', email: '', password: '', password_confirmation: '', role: 'user' });
        setForgotPasswordEmail('');
        setError('');
        setMessage('');
    };

    const switchMode = (mode) => {
        setFormMode(mode);
        resetForm();
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
                        Finance Tracker
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        {formMode === 'login' && 'Welcome back! Please login to your account.'}
                        {formMode === 'register' && 'Create your account to get started.'}
                        {formMode === 'forgotPassword' && 'Enter your email to reset password.'}
                    </p>
                </div>

                {/* Mode Switcher */}
                {formMode !== 'forgotPassword' && (
                    <div style={{ 
                        display: 'flex', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '4px',
                        marginBottom: '30px'
                    }}>
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: formMode === 'login' ? '#667eea' : 'transparent',
                                color: formMode === 'login' ? 'white' : '#666',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('register')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: formMode === 'register' ? '#667eea' : 'transparent',
                                color: formMode === 'register' ? 'white' : '#666',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Register
                        </button>
                    </div>
                )}

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

                {/* Login Form */}
                {formMode === 'login' && (
                    <form onSubmit={handleLogin}>
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        />
                        
                        <InputField
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <CustomButton
                                label={loading ? "Logging in..." : "Login"}
                                type="submit"
                                styleType="primary"
                                disabled={loading}
                            />
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button
                                type="button"
                                onClick={() => switchMode('forgotPassword')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#667eea',
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                )}

                {/* Register Form */}
                {formMode === 'register' && (
                    <form onSubmit={handleRegister}>
                        <InputField
                            label="Full Name"
                            type="text"
                            placeholder="Enter your full name"
                            value={registerData.name}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        />
                        
                        <InputField
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        />
                        
                        <InputField
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your password"
                            value={registerData.password_confirmation}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                        />

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Account Type
                            </label>
                            <select
                                value={registerData.role}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, role: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="user">Regular User</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <CustomButton
                                label={loading ? "Creating Account..." : "Create Account"}
                                type="submit"
                                styleType="primary"
                                disabled={loading}
                            />
                        </div>
                    </form>
                )}

                {/* Forgot Password Form */}
                {formMode === 'forgotPassword' && (
                    <form onSubmit={handleForgotPassword}>
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="Enter your email address"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <CustomButton
                                label={loading ? "Sending..." : "Send Reset Link"}
                                type="submit"
                                styleType="primary"
                                disabled={loading}
                            />
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#667eea',
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <Link to="/" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}