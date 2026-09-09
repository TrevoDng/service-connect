// src/account/components/Auth/email-verification/ResendVerification.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResendVerification.module.scss';

const API_BASE = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Origin": window.location.origin,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 'ALREADY_VERIFIED') {
          setError('This email is already verified. Please login.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        throw new Error(data.message || data.error?.message || 'Failed to resend verification');
      }

      setSuccess(true);
      setResendCount(prev => prev + 1);
      
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Verification email sent! Please check your inbox.' }
        });
      }, 5000);

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.resendContainer}>
      <div className={styles.resendCard}>
        <div className={styles.resendHeader}>
          <div className={styles.resendIcon}>📧</div>
          <h2 className={styles.resendTitle}>Resend Verification Email</h2>
          <p className={styles.resendSubtitle}>
            Enter your email address to receive a new verification link
          </p>
        </div>

        {success ? (
          <div className={styles.resendSuccess}>
            <div className={styles.successIcon}>✅</div>
            <h3>Verification Email Sent!</h3>
            <p>
              We've sent a new verification link to <strong>{email}</strong>.
              Please check your inbox (and spam folder) and click the link to verify your account.
            </p>
            {resendCount > 1 && (
              <p className={styles.resendHint}>
                ⏳ Please wait a few minutes before requesting another email.
              </p>
            )}
            <div className={styles.resendActions}>
              <button 
                onClick={() => navigate('/login')}
                className={styles.resendButton}
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.resendForm} onSubmit={handleResend}>
            {error && (
              <div className={styles.resendError}>
                <span className={styles.errorIcon}>⚠️</span>
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            <div className={styles.resendField}>
              <label htmlFor="email" className={styles.resendLabel}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`${styles.resendInput} ${error ? styles.error : ''}`}
                placeholder="Enter your registered email"
                disabled={isLoading}
              />
              <p className={styles.resendHint}>
                Enter the email you used to register your account
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.resendButton}
            >
              {isLoading ? (
                <span className={styles.buttonLoading}>
                  <span className={styles.buttonSpinner}></span>
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>

            <div className={styles.resendFooter}>
              <p>
                Already verified?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className={styles.footerLink}
                >
                  Go to Login
                </button>
              </p>
              <p className={styles.resendHelp}>
                <a href="/register">Don't have an account? Register</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResendVerification;
