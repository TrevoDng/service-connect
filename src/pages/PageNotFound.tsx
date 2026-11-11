// src/pagenotfound/pagenotfound.tsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompass,
  faHome,
  faArrowLeft,
  faSignInAlt,
  faTachometerAlt,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';
import styles from './PageNotFound.module.scss';

// Common URL typos → suggested fix
const PATH_SUGGESTIONS: Array<{ pattern: RegExp; fix: string; reason: string }> = [
  { pattern: /^\/admin\/dashboard/i,    fix: '/admin-dashboard',    reason: 'The admin route uses a hyphen: /admin-dashboard' },
  { pattern: /^\/employee\/dashboard/i, fix: '/employee-dashboard', reason: 'The employee route uses a hyphen: /employee-dashboard' },
  { pattern: /^\/provider\/dashboard/i, fix: '/provider/dashboard', reason: 'Provider dashboards live under /provider/dashboard' },
  { pattern: /^\/client\/dashboard/i,   fix: '/client/dashboard',   reason: 'Client dashboards live under /client/dashboard' },
];

export const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const dashboardForRole = (): string => {
    switch (user?.role) {
      case 'ADMIN':    return '/admin-dashboard';
      case 'EMPLOYEE': return '/employee-dashboard';
      case 'PROVIDER': return '/provider/dashboard';
      case 'CLIENT':   return '/client/dashboard';
      default:         return '/';
    }
  };

  const suggestion = useMemo(
    () => PATH_SUGGESTIONS.find((s) => s.pattern.test(location.pathname)),
    [location.pathname]
  );

  return (
    <div className={styles.pageNotFound}>
      <span className={styles.notFoundIcon}>
        <FontAwesomeIcon icon={faCompass} />
      </span>

      <div className={styles.errorCode}>404</div>
      <h1 className={styles.notFoundTitle}>Page Not Found</h1>
      <p className={styles.notFoundMessage}>
        We couldn't find the page you were looking for.
        It may have been moved, deleted, or the URL might be incorrect.
      </p>

      {suggestion && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0.75rem 1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            maxWidth: 520,
          }}
        >
          <FontAwesomeIcon icon={faLightbulb} style={{ color: '#f59e0b' }} />
          <span>{suggestion.reason}</span>
          <button
            type="button"
            onClick={() => navigate(suggestion.fix, { replace: true })}
            style={{
              background: 'transparent',
              border: '1px solid #f59e0b',
              color: '#d97706',
              padding: '4px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              marginLeft: '0.25rem',
            }}
          >
            Go there
          </button>
        </div>
      )}

      <div className={styles.notFoundActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Go Back
        </button>

        {isAuthenticated ? (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate(dashboardForRole())}
          >
            <FontAwesomeIcon icon={faTachometerAlt} />
            My Dashboard
          </button>
        ) : (
          <>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate('/')}
            >
              <FontAwesomeIcon icon={faHome} />
              Go Home
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/login')}
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              Sign In
            </button>
          </>
        )}
      </div>

      {location.pathname !== '/' && (
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.8rem',
            color: 'var(--text-light)',
            opacity: 0.7,
          }}
        >
          Requested:{' '}
          <code style={{ fontFamily: 'monospace' }}>
            {location.pathname}
            {location.search}
          </code>
        </p>
      )}
    </div>
  );
};

export default PageNotFound;