// src/nav/TopNavbar.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import type { User } from '../account/types/user';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon,faPersonDigging, faBars, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './TopNavbar.module.scss';

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
  onLogout,
  currentPage,
  setCurrentPage,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
    navigate(getUrl('/login', '')[0]);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav 
      className={`${styles.topNavbar} ${isMobileMenuOpen ? styles.topNavbarMobile : ''} ${scrolled ? styles.topNavbarScrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link 
        to={getUrl('/', '')[0]} 
        className={styles.topNavbarLogo}
        onClick={closeMobileMenu}
      >
      <FontAwesomeIcon icon={faPersonDigging} />
        SC
      </Link>

      {/* Navigation Links */}
      <div className={styles.topNavbarLinks}>
        <Link 
          to={getUrl('/services', '')[0]} 
          onClick={closeMobileMenu}
          className={currentPage === '/services' ? styles.active : ''}
        >
          Services
        </Link>
        <Link 
          to={getUrl('/about', '')[0]} 
          onClick={closeMobileMenu}
          className={currentPage === '/about' ? styles.active : ''}
        >
          About
        </Link>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 0.5rem)' }}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className={styles.themeToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </button>

        {/* User Section */}
        {user ? (
          <>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {getInitials(user.name)}
              </div>
              <span className={styles.userName}>
                {user.name || 'User'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className={styles.logoutBtn}
            >
              Logout
            </button>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link 
              to={getUrl('/login', '')[0]} 
              className={styles.loginBtn}
              onClick={() => {
                closeMobileMenu();
                if (setCurrentPage) setCurrentPage(getUrl('/login', '')[0]);
              }}
            >
              Login
            </Link>
            <Link 
              to={getUrl('/register', '')[0]} 
              className={styles.registerBtn}
              onClick={() => {
                closeMobileMenu();
                if (setCurrentPage) setCurrentPage(getUrl('/register', '')[0]);
              }}
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.topNavbarMenuBtn} 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
