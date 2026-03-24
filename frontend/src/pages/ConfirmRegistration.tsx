import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmRegistration } from '../api/services';
import './Auth.css';

const ConfirmRegistration: React.FC = () => {
    const [params] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>(''); // Added message state

    useEffect(() => {
        const token = params.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No confirmation token found.'); // Set message for missing token
            return;
        }

        confirmRegistration(token)
            .then(() => {
                setStatus('success');
                setMessage('Your account has been successfully verified! You can now login.');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link might be invalid or expired.'); // Use error message from response
            });
    }, [params]); // Added params to dependency array

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <>
                        <div className="auth-logo">⏳</div>
                        <h1 className="auth-title">Confirming…</h1>
                        <p className="auth-sub">Please wait while we confirm your email.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="auth-logo text-green-500">✓</div>
                        <h1 className="auth-title">Success</h1>
                        <p className="auth-sub">{message}</p>
                        <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                            Go to Login
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="auth-logo text-red-500">❌</div>
                        <h1 className="auth-title">Verification Failed</h1>
                        <p className="auth-sub text-red-400">{message}</p>
                        <Link to="/login" className="auth-link" style={{ marginTop: '1rem', display: 'block' }}>
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfirmRegistration;
