// EmployeeLogin.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LoginCredentials } from '../../../types/user';
//import { useSlider } from '../../../../slider/slidercontext/SliderContext'; 
// @ts-ignore: CSS module declarations not defined in this project
import './EmployeeLogin.css';
import { useNavigate } from 'react-router-dom';
//import { useMainCategoryContext } from '../../../../itemsComponents/products/category-filter/context/MainCategoryFilterContext';

const EmployeeLogin: React.FC = () => {
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  //const navigate = useNavigate();

  // const { hideSlider } = useSlider();
  // const {hideMainCategory} = useMainCategoryContext();
  //          //hide slider
  //              hideSlider();
  //              hideMainCategory();

  // Redirect if already authenticated as employee
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'EMPLOYEE') {
        if (user.status === 'active') {
          window.location.href = '/employee/dashboard';
        }
      } else if (user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (user.role === 'CLIENT') {
        window.location.href = '/account';
      }
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowPendingMessage(false);

    try {
      const loginCredentials: LoginCredentials = {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      };

      await login(loginCredentials);
      // The useEffect above will handle redirect after authentication
      
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid email or password';
      
      // Handle specific error messages from server
      if (errorMessage.includes('EMAIL_NOT_VERIFIED')) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else if (errorMessage.includes('PENDING_APPROVAL')) {
        setShowPendingMessage(true);
        setError('Your account is pending admin approval. You will receive an email once approved.');
      } else if (errorMessage.includes('ACCOUNT_INACTIVE')) {
        setError('Your account is not active. Please contact your administrator.');
      } else if (errorMessage.includes('INVALID_CREDENTIALS')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
    if (showPendingMessage) setShowPendingMessage(false);
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-box">
        {/* Header */}
        <div className="employee-login-header">
          <div className="employee-login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 3L19 5L23 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="employee-login-title">Employee Portal</h2>
          <p className="employee-login-subtitle">
            Access your work dashboard and manage tasks
          </p>
        </div>

        {/* Login Form */}
        <form className="employee-login-form" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className={`employee-login-message ${showPendingMessage ? 'employee-login-pending' : 'employee-login-error'}`}>
              <div className="message-icon">
                {showPendingMessage ? '⏳' : '⚠️'}
              </div>
              <div className="message-text">{error}</div>
            </div>
          )}

          {/* Email Field */}
          <div className="employee-login-field">
            <label htmlFor="email" className="employee-login-label">
              Email Address
            </label>
            <div className="employee-login-input-wrapper">
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="employee-login-input"
                placeholder="employee@company.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="employee-login-field">
            <label htmlFor="password" className="employee-login-label">
              Password
            </label>
            <div className="employee-login-input-wrapper">
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C10 3 5 4 5 9C5 12 6 15 12 15C18 15 19 12 19 9C19 4 14 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 15V21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 18H15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="employee-login-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Options */}
          <div className="employee-login-options">
            <label className="employee-login-checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="employee-login-forgot">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="employee-login-button"
          >
            {isLoading ? (
              <span className="employee-login-button-loading">
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in to Employee Portal'
            )}
          </button>
        </form>

        {/* Info Box for Pending Approval */}
        <div className="employee-login-info">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <p className="info-title">New Employee?</p>
            <p className="info-text">
              You need a security code to register. Contact your administrator to get one.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="employee-login-footer">
          <div className="footer-links">
            <a href="/register/employee" className="footer-link">
              Register as Employee
            </a>
            <span className="separator">•</span>
            <a href="/login" className="footer-link">
              Customer Login
            </a>
            <span className="separator">•</span>
            <a href="/login/admin" className="footer-link">
              Admin Login
            </a>
          </div>
          <div className="footer-help">
            <a href="/help/employee" className="help-link">
              Need help? Contact HR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;