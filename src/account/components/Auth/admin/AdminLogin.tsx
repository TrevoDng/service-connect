// src/account/components/Auth/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LoginCredentials } from '../../../types/user';
//@ts-ignore
//import './AdminLogin.css';
//import { useSlider } from '../../../../slider/slidercontext/SliderContext';
//import { useMainCategoryContext } from '../../../../itemsComponents/products/category-filter/context/MainCategoryFilterContext';

const AdminLogin: React.FC = () => {
  const { login, user, isLoading, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  //const { hideSlider } = useSlider();
  //const {hideMainCategory} = useMainCategoryContext();
           //hide slider
               //hideSlider();
              // hideMainCategory();

  // Check if user is admin after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        setError('This account does not have admin privileges. Please use an admin account.');
        // Optionally logout non-admin users
        // You could call logout here if needed
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
      // The useEffect above will handle redirect after user is loaded
      
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
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="admin-login-icon">🔐</div>
          <h2 className="admin-login-title">Admin Portal</h2>
          <p className="admin-login-subtitle">Secure access for administrators only</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="email" className="admin-login-label">
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
              className="admin-login-input"
              placeholder="admin@company.com"
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="password" className="admin-login-label">
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
              className="admin-login-input"
              placeholder="••••••••"
            />
          </div>

          <div className="admin-login-options">
            <label className="admin-login-checkbox">
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
            className="admin-login-button"
          >
            {(isLoading || isLoggingIn) ? 'Signing in...' : 'Sign in to Admin Portal'}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/login">Customer Login</a>
          <span className="separator">•</span>
          <a href="/login/employee">Employee Login</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;