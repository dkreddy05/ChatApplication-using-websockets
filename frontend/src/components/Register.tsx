import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/services';
import './forms.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    nickname: '',
    mail: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        firstname: formData.firstname,
        lastname: formData.lastname,
        nickname: formData.nickname,
        mail: formData.mail,
        password: formData.password,
      });
      setSuccess('Account created! Check your email to confirm, then sign in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main">
      {/* Brand logo */}
      <div className="auth-logo">
        <i className="fas fa-paper-plane" />
      </div>

      <div className="auth-title">Create Account</div>
      <div className="auth-subtitle">Join ChatMate and start connecting</div>

      <form className="form" onSubmit={handleRegister} style={{ maxWidth: 440 }}>
        <fieldset>
          {error && <div className="alert alert-error"><p>{error}</p></div>}
          {success && <div className="alert alert-success"><p>{success}</p></div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group field">
              <input
                type="text"
                className="form-field"
                placeholder="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="form-group field">
              <input
                type="text"
                className="form-field"
                placeholder="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group field">
            <input
              type="text"
              className="form-field"
              placeholder="Nickname (e.g. @johndoe)"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group field">
            <input
              type="email"
              className="form-field"
              placeholder="Email Address"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group field">
            <input
              type="password"
              className="form-field"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group field">
            <input
              type="password"
              className="form-field"
              placeholder="Confirm Password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </div>

          <div className="form-link">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default Register;
