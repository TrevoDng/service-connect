// src/nav/TopNavbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import type { User } from '../account/types/user';
import { useAuth } from '../account/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//@ts-ignore
import './TopNavbar.css';

interface TopNavbarProps {
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onRegister?: () => void;
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  user, 
  onLogin, 
  onLogout, 
  onRegister,
  currentPage,
  setCurrentPage
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    logout();
    if (onLogout) onLogout();
    navigate(getUrl('/')[0]);
  };

  const handleLogin = () => {
    setIsMobileMenuOpen(false);
    if (onLogin) onLogin();
    if (setCurrentPage) setCurrentPage('/login');
    navigate(getUrl('/login')[0]);
  };

  const handleRegister = () => {
    setIsMobileMenuOpen(false);
    if (onRegister) onRegister();
    if (setCurrentPage) setCurrentPage('/register');
    navigate(getUrl('/register')[0]);
  };

  const handleLogoClick = () => {
    if (setCurrentPage) setCurrentPage('/');
    console.log(currentPage);
    navigate(getUrl('/')[0]);
  };

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
  ];

  return (
    <nav className="top-navbar">
      <div className="nav-container">
        {/* Logo / Brand */}
        <div className="nav-brand" onClick={handleLogoClick}>
          <span className="brand-icon" 
          style={{ marginRight: '8px', fontSize: '1.5rem', border: '1px solid #ccc', padding: '4px', borderRadius: '4px' }}>
            <FontAwesomeIcon icon={'screwdriver-wrench'} /></span>
          <span className="brand-text">Service Connect</span>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={getUrl(item.path)[0]} 
              className="nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {user && (
            <>
              <Link 
                to={getUrl('/dashboard')[0]} 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to={getUrl('/account')[0]} 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </>
          )}
          
          {/* Mobile Auth Buttons (only visible in mobile menu) */}
          {!user && (
            <div className="nav-actions-mobile">
              <div className="auth-buttons">
                <button className="login-btn" onClick={handleLogin}>
                  Login
                </button>
                <button className="register-btn" onClick={handleRegister}>
                  Register
                </button>
              </div>
            </div>
          )}
          
          {/* Mobile User Menu (only visible in mobile menu) */}
          {user && (
            <div className="nav-actions-mobile">
              <div className="user-menu-mobile">
                <div className="user-info-mobile">
                  <span className="user-avatar-mobile">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
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
                  {user.firstName?.charAt(0).toUpperCase() || 'U'}
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
                  <Link to={getUrl('/account')[0]} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    My Profile
                  </Link>
                  <Link to={getUrl('/settings')[0]} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    Settings
                  </Link>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={handleLogin}>Login</button>
              <button className="register-btn" onClick={handleRegister}>Register</button>
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
