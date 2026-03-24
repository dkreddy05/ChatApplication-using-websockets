import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/services';
import './Auth.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginUser({ username: username, password });
            navigate('/dashboard');
        } catch (err: unknown) {
            // Prefer backend-provided message (Spring Security failure handler)
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const serverMessage = (err.response?.data as any)?.message;

                // Common backend mismatch: passwords saved as plain text but BCrypt expected
                if (typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('bcrypt')) {
                    setError(
                        'Login failed due to password format mismatch (BCrypt). If this user was created via /api/Users/signUp, passwords are stored unencrypted. Register via /api/registration or fix backend signUp to encode passwords.'
                    );
                    return;
                }

                if (status === 401) {
                    setError(serverMessage || 'Invalid credentials. Please try again.');
                    return;
                }

                setError(serverMessage || `Login failed (${status ?? 'network error'}). Please try again.`);
                return;
            }

            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">💬</div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-sub">Sign in to continue</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label>Email address</label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="jane@example.com"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? <span className="spinner sm" /> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
