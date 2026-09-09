// src/account/components/Auth/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { LoginCredentials } from '../../../types/user';
import styles from './AdminLogin.module.scss';

const AdminLogin: React.FC = () => {
  const { login, user, isLoading, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        setError('This account does not have admin privileges. Please use an admin account.');
      }
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const loginCredentials: LoginCredentials = {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      };

      await login(loginCredentials);
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
      setIsLoggingIn(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className={styles.adminLoginContainer}>
      <div className={styles.adminLoginBox}>
        <div className={styles.adminLoginHeader}>
          <div className={styles.adminLoginIcon}>🔐</div>
          <h2 className={styles.adminLoginTitle}>Admin Portal</h2>
          <p className={styles.adminLoginSubtitle}>Secure access for administrators only</p>
        </div>

        <form className={styles.adminLoginForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.adminLoginError}>
              {error}
            </div>
          )}

          <div className={styles.adminLoginField}>
            <label htmlFor="email" className={styles.adminLoginLabel}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className={styles.adminLoginInput}
              placeholder="admin@company.com"
            />
          </div>

          <div className={styles.adminLoginField}>
            <label htmlFor="password" className={styles.adminLoginLabel}>
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
              className={styles.adminLoginInput}
              placeholder="••••••••"
            />
          </div>

          <div className={styles.adminLoginOptions}>
            <label className={styles.adminLoginCheckbox}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLoggingIn}
            className={styles.adminLoginButton}
          >
            {(isLoading || isLoggingIn) ? 'Signing in...' : 'Sign in to Admin Portal'}
          </button>
        </form>

        <div className={styles.adminLoginFooter}>
          <a href="/login">Customer Login</a>
          <span className={styles.separator}>•</span>
          <a href="/login/employee">Employee Login</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
