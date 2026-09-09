// src/pages/PageNotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import styles from './PageNotFound.module.scss';

const PageNotFound: React.FC = () => {
  return (
    <div className={styles.pageNotFound}>
      <span className={styles.notFoundIcon}>🔍</span>
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.notFoundTitle}>Page Not Found</h1>
      <p className={styles.notFoundMessage}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className={styles.notFoundActions}>
        <Link to={getUrl('/', '')[0]} className={styles.primaryButton}>
          ← Go Home
        </Link>
        <Link to={getUrl('/services', '')[0]} className={styles.secondaryButton}>
          Browse Services
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
