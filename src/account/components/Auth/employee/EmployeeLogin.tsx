// src/account/components/Auth/employee/EmployeeLogin.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { LoginCredentials } from '../../../types/user';
import styles from './EmployeeLogin.module.scss';

const EmployeeLogin: React.FC = () => {
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [showPendingMessage, setShowPendingMessage] = useState(false);

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
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid email or password';
      
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
    if (error) setError('');
    if (showPendingMessage) setShowPendingMessage(false);
  };

  return (
    <div className={styles.employeeLoginContainer}>
      <div className={styles.employeeLoginBox}>
        {/* Header */}
        <div className={styles.employeeLoginHeader}>
          <div className={styles.employeeLoginIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 3L19 5L23 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.employeeLoginTitle}>Employee Portal</h2>
          <p className={styles.employeeLoginSubtitle}>
            Access your work dashboard and manage tasks
          </p>
        </div>

        {/* Login Form */}
        <form className={styles.employeeLoginForm} onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className={`${styles.employeeLoginMessage} ${showPendingMessage ? styles.employeeLoginPending : styles.employeeLoginError}`}>
              <div className={styles.messageIcon}>
                {showPendingMessage ? '⏳' : '⚠️'}
              </div>
              <div className={styles.messageText}>{error}</div>
            </div>
          )}

          {/* Email Field */}
          <div className={styles.employeeLoginField}>
            <label htmlFor="email" className={styles.employeeLoginLabel}>
              Email Address
            </label>
            <div className={styles.employeeLoginInputWrapper}>
              <span className={styles.inputIcon}>
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
                className={styles.employeeLoginInput}
                placeholder="employee@company.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className={styles.employeeLoginField}>
            <label htmlFor="password" className={styles.employeeLoginLabel}>
              Password
            </label>
            <div className={styles.employeeLoginInputWrapper}>
              <span className={styles.inputIcon}>
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
                className={styles.employeeLoginInput}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Options */}
          <div className={styles.employeeLoginOptions}>
            <label className={styles.employeeLoginCheckbox}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className={styles.employeeLoginForgot}>
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.employeeLoginButton}
          >
            {isLoading ? (
              <span className={styles.employeeLoginButtonLoading}>
                <svg className={styles.spinner} viewBox="0 0 24 24">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in to Employee Portal'
            )}
          </button>
        </form>

        {/* Info Box for Pending Approval */}
        <div className={styles.employeeLoginInfo}>
          <div className={styles.infoIcon}>ℹ️</div>
          <div className={styles.infoContent}>
            <p className={styles.infoTitle}>New Employee?</p>
            <p className={styles.infoText}>
              You need a security code to register. Contact your administrator to get one.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className={styles.employeeLoginFooter}>
          <div className={styles.footerLinks}>
            <a href="/register/employee" className={styles.footerLink}>
              Register as Employee
            </a>
            <span className={styles.separator}>•</span>
            <a href="/login" className={styles.footerLink}>
              Customer Login
            </a>
            <span className={styles.separator}>•</span>
            <a href="/login/admin" className={styles.footerLink}>
              Admin Login
            </a>
          </div>
          <div className={styles.footerHelp}>
            <a href="/help/employee" className={styles.helpLink}>
              Need help? Contact HR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
