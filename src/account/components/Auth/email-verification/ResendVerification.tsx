import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useSlider } from '../../../../slider/slidercontext/SliderContext';
// import { useMainCategoryContext } from '../../../../itemsComponents/products/category-filter/context/MainCategoryFilterContext';
// TypeScript may complain about side-effect CSS imports if no declaration is present.
// Ignore the next line to avoid "Cannot find module" compile errors in this file.
// @ts-ignore
import './ResendVerification.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  
  // const { hideSlider } = useSlider();
  // const { hideMainCategory } = useMainCategoryContext();
  
  // // Hide UI elements
  // hideSlider();
  // hideMainCategory();

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
        // Handle specific error messages
        if (data.error?.code === 'ALREADY_VERIFIED') {
          setError('This email is already verified. Please login.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        throw new Error(data.message || data.error?.message || 'Failed to resend verification');
      }

      setSuccess(true);
      setResendCount(prev => prev + 1);
      
      // Auto-redirect after 5 seconds
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
    <div className="resend-verification-container">
      <div className="resend-verification-card">
        <div className="resend-header">
          <div className="resend-icon">📧</div>
          <h2 className="resend-title">Resend Verification Email</h2>
          <p className="resend-subtitle">
            Enter your email address to receive a new verification link
          </p>
        </div>

        {success ? (
          <div className="resend-success">
            <div className="success-icon">✅</div>
            <h3>Verification Email Sent!</h3>
            <p>
              We've sent a new verification link to <strong>{email}</strong>.
              Please check your inbox (and spam folder) and click the link to verify your account.
            </p>
            {resendCount > 1 && (
              <p className="resend-hint">
                ⏳ Please wait a few minutes before requesting another email.
              </p>
            )}
            <div className="resend-actions">
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <form className="resend-form" onSubmit={handleResend}>
            {error && (
              <div className="resend-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <div className="resend-field">
              <label htmlFor="email" className="resend-label">
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
                className={`resend-input ${error ? 'error' : ''}`}
                placeholder="Enter your registered email"
                required
                disabled={isLoading}
              />
              <p className="resend-hint">
                Enter the email you used to register your account
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="resend-button"
            >
              {isLoading ? (
                <span className="button-loading">
                  <span className="button-spinner"></span>
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>

            <div className="resend-footer">
              <p>
                Already verified?{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="footer-link"
                >
                  Go to Login
                </button>
              </p>
              <p className="resend-help">
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