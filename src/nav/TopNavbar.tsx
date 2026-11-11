// src/nav/TopNavbar.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import type { User } from '../account/types/user';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun, 
  faMoon, 
  faBars, 
  faTimes, 
  faTachometerAlt,
  faPersonDigging,
  faUser,
  faCog,           
  faQuestionCircle,
  faSignOutAlt  
} from '@fortawesome/free-solid-svg-icons';
import { NotificationBell } from '../components/Notifications';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  // 👇 Add this effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Get user initials from firstName and lastName
  const getInitials = (user?: User | null) => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get user's full name
  const getFullName = (user?: User | null) => {
    if (!user) return 'User';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first} ${last}`.trim() || 'User';
  };

    // Get the correct dashboard URL based on role
  const getDashboardRoute = (user?: User | null) => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return getUrl('/admin-dashboard', '')[0];
    if (user.role === 'EMPLOYEE') return getUrl('/employee-dashboard', '')[0];
    if (user.role === 'PROVIDER') return getUrl('/provider/dashboard', '')[0];
    return getUrl('/client/dashboard', '')[0];
  };

  return (
    <nav
      className={`${styles.topNavbar} ${isMobileMenuOpen ? styles.topNavbarMobile : ''} ${scrolled ? styles.topNavbarScrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo with icon */}
      <Link
        to={getUrl('/', '')[0]}
        className={styles.topNavbarLogo}
        onClick={closeMobileMenu}
      >
        <FontAwesomeIcon
          icon={faPersonDigging}
          className={styles.logoIcon}
        />
        <span className={styles.logoMobile}>SC</span>
        <span className={styles.logoDesktop}>ServiceConnect</span>
      </Link>

      {/* Navigation Links */}
      <div className={styles.topNavbarLinks}>
        {/* 👇 ADD THIS BLOCK */}
        {user && (
          <Link
            to={getDashboardRoute(user)}
            onClick={closeMobileMenu}
            className={styles.dashboardLink}
          >
            <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '6px' }} />
            Dashboard
          </Link>
        )}
        {/* 👆 END OF BLOCK */}

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
      <div className={styles.rightSection}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </button>

        {/* Notifications — only when logged in */}
        {user && <NotificationBell />}

        {/* User Section */}
        {user ? (
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button 
              className={styles.userInfoBtn} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={styles.avatar}>
                {getInitials(user)}
              </div>
              <span className={styles.userName}>
                {getFullName(user)}
              </span>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <strong>{getFullName(user)}</strong>
                  <span>{user.email}</span>
                </div>
                
                <button 
                  className={styles.dropdownItem}
                  onClick={() => { navigate(getUrl('/account')[0]); setIsDropdownOpen(false); }}
                >
                  <FontAwesomeIcon icon={faUser} /> Go to Profile
                </button>
                
                <button 
                  className={styles.dropdownItem}
                  onClick={() => { navigate(getUrl('/settings')[0]); setIsDropdownOpen(false); }}
                >
                  <FontAwesomeIcon icon={faCog} /> Settings
                </button>
                
                <button 
                  className={styles.dropdownItem}
                  onClick={() => { navigate(getUrl('/help')[0]); setIsDropdownOpen(false); }}
                >
                  <FontAwesomeIcon icon={faQuestionCircle} /> Help
                </button>
                
                <div className={styles.dropdownDivider} />
                
                <button 
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
                </button>
              </div>
            )}
          </div>
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
