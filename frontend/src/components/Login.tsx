import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/services';
import './forms.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await loginUser({ username: email, password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main">
      {/* Brand logo */}
      <div className="auth-logo">
        <i className="fas fa-paper-plane" />
      </div>

      <div className="auth-title">Welcome back</div>
      <div className="auth-subtitle">Sign in to ChatMate</div>

      <form className="form" onSubmit={handleLogin}>
        <fieldset className="login-fieldset">
          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-group field">
            <input
              type="email"
              className="form-field"
              placeholder="Email Address"
              name="username"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group field">
            <input
              type="password"
              className="form-field"
              placeholder="Password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          <div className="form-link">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default Login;
