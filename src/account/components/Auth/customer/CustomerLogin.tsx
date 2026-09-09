// src/account/components/Auth/customer/CustomerLogin.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import type { LoginCredentials } from '../../../types/user';
import { getUrl } from '../../../../services/getUrl';
import styles from './CustomerLogin.module.scss';

const CustomerLogin: React.FC = () => {
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get('registered');
    const verified = urlParams.get('verified');
    const message = urlParams.get('message');
    const adminCreated = urlParams.get('admin_created');
    
    if (registered === 'true') {
      setSuccessMessage('Registration successful! Please log in with your credentials.');
    } else if (verified === 'true' && message) {
      setSuccessMessage(decodeURIComponent(message));
    } else if (adminCreated === 'true') {
      setSuccessMessage('Admin account created successfully! Please log in.');
    }
    
    if (registered || verified || adminCreated) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate(getUrl('/admin-dashboard', 'ADMIN')[0]);
      } else if (user.role === 'EMPLOYEE') {
        navigate(getUrl('/employee-dashboard', 'EMPLOYEE')[0]);
      } else {
        navigate(getUrl('/services')[0]);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await login(credentials);
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      
      if (errorMessage.includes('EMAIL_NOT_VERIFIED') || 
          errorMessage.includes('Please verify your email')) {
        setError('Please verify your email before logging in.');
        setTimeout(() => {
          navigate(`/resend-verification?email=${encodeURIComponent(credentials.email)}`);
        }, 1500);
      } else if (errorMessage.includes('PENDING_APPROVAL')) {
        setError('Your account is pending admin approval. You will be notified once approved.');
      } else if (errorMessage.includes('ACCOUNT_INACTIVE')) {
        setError('Your account is not active. Please contact support for assistance.');
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
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div>
          <h2 className={styles.loginTitle}>Sign in to your account</h2>
          <p className={styles.loginSubtitle}>
            Or{' '}
            <Link to={getUrl('/register', 'CLIENT')[0]} className={styles.loginLink}>
              create a new account
            </Link>
          </p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.loginError}>
              <div className={styles.loginErrorText}>{error}</div>
            </div>
          )}
          
          {successMessage && (
            <div className={styles.loginSuccess}>
              <div className={styles.loginSuccessText}>{successMessage}</div>
            </div>
          )}

          <div className={styles.loginInputGroup}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className={styles.loginInput}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                className={styles.loginInput}
                placeholder="Password"
              />
            </div>
          </div>

          <div className={styles.loginOptions}>
            <div className={styles.loginCheckboxWrapper}>
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={credentials.rememberMe}
                onChange={handleChange}
                className={styles.loginCheckbox}
              />
              <label htmlFor="remember-me" className={styles.loginCheckboxLabel}>
                Remember me
              </label>
            </div>

            <div className={styles.loginForgot}>
              <Link to={getUrl('/forgot-password', 'CLIENT')[0]} className={styles.loginForgotLink}>
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? (
                <span className={styles.loginButtonLoading}>
                  <svg
                    className={styles.loginSpinner}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className={styles.loginRegisterLink}>
            <Link to={getUrl('/register', 'CLIENT')[0]}>Don't have an account? Register</Link>
            <div className={styles.loginRegisterDivider}>
              <Link to={getUrl('/service-provider-register', 'EMPLOYEE')[0]}>Register here as a Service provider</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerLogin;
