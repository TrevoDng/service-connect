// src/account/components/Auth/EmailVerification.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @ts-ignore
import './EmailVerification.css';
//import { useMainCategoryContext } from '../../../../itemsComponents/products/category-filter/context/MainCategoryFilterContext';
//import { useSlider } from '../../../../slider/slidercontext/SliderContext';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  // const { hideSlider } = useSlider();
  // const { hideMainCategory } = useMainCategoryContext();
  
  // hideSlider();
  // hideMainCategory();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('reason');
    const msg = searchParams.get('message');
    const token = searchParams.get('token');

    // ✅ Case 1: Redirect from backend with verified=true
    if (verified === 'true') {
      setStatus('success');
      setMessage(msg || 'Email verified successfully!');
      return;
    }

    // ✅ Case 2: Error from backend redirect
    if (error) {
      setStatus('error');
      setMessage(error === 'invalid-token' ? 'Invalid or expired verification link.' : 'Verification failed. Please try again.');
      return;
    }

    // ✅ Case 3: Token in URL - call backend to verify
    if (token) {
      verifyTokenWithBackend(token);
      return;
    }

    // No params = invalid link
    setStatus('error');
    setMessage('Invalid verification link.');
  }, [searchParams]);

  // ✅ Call backend to verify token
  const verifyTokenWithBackend = async (token: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch(`${API_BASE}/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // ✅ Tell backend we want JSON
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Success
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        // ❌ Failed
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
    <div className="verification-container">
      <div className="verification-card">
        {status === 'loading' && (
          <div className="verification-loading">
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <div className="verification-actions">
              <button onClick={handleLogin} className="btn-primary">
                Proceed to Login
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="verification-error">
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className="verification-actions">
              <button onClick={handleResendVerification} className="btn-secondary">
                Resend Verification Email
              </button>
              <button onClick={handleLogin} className="btn-primary">
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