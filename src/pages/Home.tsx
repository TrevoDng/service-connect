// src/pages/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import { useTheme } from '../styles/context/ThemeContext';
import styles from './Home.module.scss';

interface HomeProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({
  setCurrentPage
}) => {
  const { theme } = useTheme();

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            <span className={styles.highlight}>Service</span>Connect
          </h1>
          <p className={styles.tagline}>
            Find trusted professionals for your home services
            <br />
            or grow your business by connecting with clients
          </p>
          
          <div className={styles.authButtons}>
            <Link 
              to={getUrl('/login', '')[0]} 
              className={styles.ctaButton}
              onClick={() => setCurrentPage(getUrl('/login', '')[0])}
            >
              Hire / Get Hired
            </Link>
            
            <Link 
              to={getUrl('/admin-dashboard', 'ADMIN')[0]} 
              className={styles.ctaButtonSecondary}
              onClick={() => setCurrentPage(getUrl('/admin-dashboard', 'ADMIN')[0])}
            >
              Admin Dashboard
            </Link>
            
            <Link 
              to={getUrl('/employee-dashboard', 'EMPLOYEE')[0]} 
              className={styles.ctaButtonSecondary}
              onClick={() => setCurrentPage(getUrl('/employee-dashboard', 'EMPLOYEE')[0])}
            >
              Employee Dashboard
            </Link>
            
            <Link 
              to={getUrl('/login', 'CLIENT')[0]} 
              className={styles.ctaButtonSecondary}
              onClick={() => setCurrentPage(getUrl('/login', 'CLIENT')[0])}
            >
              Client Login
            </Link>
            
            <Link 
              to={getUrl('/about', '')[0]} 
              className={styles.ctaButtonSecondary}
              onClick={() => setCurrentPage(getUrl('/about', '')[0])}
            >
              About
            </Link>
          </div>
        </div>
      </header>

      {/* Optional Features Section - Uncomment if needed */}
      {/*
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <span className={styles.icon}>🔧</span>
            <h3>Find Professionals</h3>
            <p>Connect with trusted service providers in your area</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.icon}>📈</span>
            <h3>Grow Your Business</h3>
            <p>Reach more clients and manage your services</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.icon}>⭐</span>
            <h3>Quality Guaranteed</h3>
            <p>Verified professionals with customer reviews</p>
          </div>
        </div>
      </section>
      */}
    </div>
  );
}

export default Home;
