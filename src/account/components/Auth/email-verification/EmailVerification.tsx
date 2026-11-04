// src/account/components/Auth/email-verification/EmailVerification.tsx 
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './EmailVerification.module.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  
  // 👇 Add this ref to prevent double-firing in StrictMode
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('reason');
    const msg = searchParams.get('message');
    const token = searchParams.get('token');
    const roleParam = searchParams.get('role');

    // 1. If backend already verified and redirected with ?verified=true
    if (verified === 'true') {
      setStatus('success');
      setMessage(msg || 'Email verified successfully!');
      if (roleParam) setRole(roleParam);
      return;
    }

    // 2. If backend redirected with an error
    if (error) {
      setStatus('error');
      setMessage(error === 'invalid-token' ? 'Invalid or expired verification link.' : 'Verification failed. Please try again.');
      return;
    }

    // 3. If frontend received the raw token from the email
    if (token) {
      // 👇 Guard the API call so it only runs once
      if (!hasAttemptedRef.current) {
        hasAttemptedRef.current = true;
        verifyTokenWithBackend(token);
      }
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
        if (data.data?.role) setRole(data.data.role);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('An error occurred. Please try again or contact support.');
    }
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        {status === 'loading' && (
          <div className={styles.verificationLoading}>
            <div className={styles.loaderBars}>
              <div className={styles.loaderBar}></div>
              <div className={styles.loaderBar}></div>
              <div className={styles.loaderBar}></div>
              <div className={styles.loaderBar}></div>
              <div className={styles.loaderBar}></div>
            </div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.verificationSuccess}>
            <div className={styles.successIcon}>✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            {role === 'EMPLOYEE' || role === 'PROVIDER' ? (
              <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-light)' }}>
                You can now log in. An admin will review your account shortly.
              </p>
            ) : null}
            <div className={styles.verificationActions}>
              <button onClick={() => navigate('/login')} className={styles.btnPrimary}>
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
              <button onClick={() => navigate('/resend-verification')} className={styles.btnSecondary}>
                Resend Verification Email
              </button>
              <button onClick={() => navigate('/login')} className={styles.btnPrimary}>
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