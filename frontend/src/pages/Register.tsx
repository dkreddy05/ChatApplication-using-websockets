import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/services';
import './Auth.css';

const Register: React.FC = () => {
    const [form, setForm] = useState({
        firstname: '', lastname: '', nickname: '', mail: '', password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser({
                firstname: form.firstname,
                lastname: form.lastname,
                nickname: form.nickname,
                mail: form.mail,
                password: form.password
            });
            setSuccess('Account created! Please check your email to confirm.');
            setTimeout(() => navigate('/login'), 2500);
        } catch {
            setError('Registration failed. Please try a different username or email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">💬</div>
                <h1 className="auth-title">Create account</h1>
                <p className="auth-sub">Join the conversation</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field-row">
                        <div className="field">
                            <label>First name</label>
                            <input value={form.firstname} onChange={set('firstname')} placeholder="Jane" required />
                        </div>
                        <div className="field">
                            <label>Last name</label>
                            <input value={form.lastname} onChange={set('lastname')} placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="field">
                        <label>Nickname</label>
                        <input value={form.nickname} onChange={set('nickname')} placeholder="janedoe99" required />
                    </div>
                    <div className="field">
                        <label>Email</label>
                        <input type="email" value={form.mail} onChange={set('mail')} placeholder="jane@example.com" required />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? <span className="spinner sm" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
