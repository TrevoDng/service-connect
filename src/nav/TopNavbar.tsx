import React, { useState } from 'react';
//@ts-ignore
import './TopNavbar.css';
import { User } from '../account/types/user';
import { useAuth } from '../account/context/AuthContext';

interface TopNavbarProps {
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onRegister?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  user, 
  onLogin, 
  onLogout, 
  onRegister 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close dropdown when toggling mobile menu
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (onLogout) onLogout();
  };

  const handleLogin = () => {
    setIsMobileMenuOpen(false);
    if (onLogin) onLogin();
  };

  const handleRegister = () => {
    setIsMobileMenuOpen(false);
    if (onRegister) onRegister();
  };

  return (
    <nav className="top-navbar">
      <div className="nav-container">
        {/* Logo / Brand */}
        <div className="nav-brand">
          <span className="brand-icon">🔧</span>
          <span className="brand-text">ServiceConnect</span>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <a href="/" className="nav-link">Home</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/services" className="nav-link">Services</a>
          {user && (
            <>
              <a href="/dashboard" className="nav-link">Dashboard</a>
              <a href="/account" className="nav-link">Profile</a>
            </>
          )}
          
          {/* Mobile Auth Buttons (only visible in mobile menu) */}
          {!user && (
            <div className="nav-actions-mobile">
              <div className="auth-buttons">
                <button className="login-btn" onClick={handleLogin}><a href="/login">Login</a></button>
                <button className="register-btn" onClick={handleRegister}><a href="/register">Register</a></button>
              </div>
            </div>
          )}
          
          {/* Mobile User Menu (only visible in mobile menu) */}
          {user && (
            <div className="nav-actions-mobile">
              <div className="user-menu-mobile">
                <div className="user-info-mobile">
                  <span className="user-avatar-mobile">
                    {user.firstName.charAt(0).toUpperCase()}
                  </span>
                  <div className="user-details-mobile">
                    <span className="user-name-mobile">{user.firstName} {user.lastName}</span>
                    <span className="user-email-mobile">{user.email}</span>
                    <span className="user-role-mobile">{user.role}</span>
                  </div>
                </div>
                <button className="logout-btn-mobile" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop User Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={toggleDropdown}
              >
                <span className="user-avatar">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.firstName} {user.lastName}</p>
                    <p className="dropdown-email">{user.email}</p>
                    <p className="dropdown-role">{user.role}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/account" className="dropdown-item">My Profile</a>
                  <a href="/settings" className="dropdown-item">Settings</a>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={handleLogin}><a href="/login">Login</a></button>
              <button className="register-btn" onClick={handleRegister}><a href="/register">Register</a></button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      </div>
    </nav>
  );
};
