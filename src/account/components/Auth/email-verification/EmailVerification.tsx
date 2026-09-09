// src/account/components/Auth/email-verification/EmailVerification.tsx 
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './EmailVerification.module.scss';

const API_BASE = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('reason');
    const msg = searchParams.get('message');
    const token = searchParams.get('token');

    if (verified === 'true') {
      setStatus('success');
      setMessage(msg || 'Email verified successfully!');
      return;
    }

    if (error) {
      setStatus('error');
      setMessage(error === 'invalid-token' ? 'Invalid or expired verification link.' : 'Verification failed. Please try again.');
      return;
    }

    if (token) {
      verifyTokenWithBackend(token);
      return;
    }

    setStatus('error');
    setMessage('Invalid verification link.');
  }, [searchParams]);

  const verifyTokenWithBackend = async (token: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch(`${API_BASE}/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.message || data.error?.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('An error occurred. Please try again or contact support.');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    navigate('/resend-verification');
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        {status === 'loading' && (
          <div className={styles.verificationLoading}>
            <div className={styles.spinner}></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.verificationSuccess}>
            <div className={styles.successIcon}>✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <div className={styles.verificationActions}>
              <button onClick={handleLogin} className={styles.btnPrimary}>
                Proceed to Login
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.verificationError}>
            <div className={styles.errorIcon}>✗</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className={styles.verificationActions}>
              <button onClick={handleResendVerification} className={styles.btnSecondary}>
                Resend Verification Email
              </button>
              <button onClick={handleLogin} className={styles.btnPrimary}>
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
