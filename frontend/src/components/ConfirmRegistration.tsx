import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmRegistration } from '../api/services';
import './forms.css';

const ConfirmRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Confirming your registration...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token.');
      return;
    }
    confirmRegistration(token)
      .then((responseMessage) => {
        setStatus('success');
        setMessage(responseMessage || 'Your account has been confirmed.');
      })
      .catch((error) => {
        console.error('Confirmation failed', error);
        setStatus('error');
        setMessage('Unable to confirm your account. The link may have expired.');
      });
  }, [searchParams]);

  const title =
    status === 'success'
      ? 'Account Confirmed'
      : status === 'error'
        ? 'Confirmation Failed'
        : 'Confirming Account';

  return (
    <div className="main">
      <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{message}</p>
        {status === 'success' && (
          <Link className="button" to="/login">
            Proceed to Login
          </Link>
        )}
        {status === 'error' && (
          <Link className="button" to="/register">
            Back to Registration
          </Link>
        )}
      </div>
    </div>
  );
};

export default ConfirmRegistration;
