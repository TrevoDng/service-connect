// src/pages/DevLogin.tsx
//
// DEV ONLY — quick role switching + demo registration.
// Remove this page and its route before production.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import {
  DEMO_USERS,
  DEMO_TOKEN,
  buildCustomDemoUser,
} from '../data/demoUsers';
import type { DemoUserSeed } from '../data/demoUsers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserTie,
  faUserShield,
  faUserCog,
  faSignOutAlt,
  faArrowRight,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from './DevLogin.module.scss';

// ============================================
// HELPERS
// ============================================

const roleIcon: Record<DemoUserSeed['role'], IconDefinition> = {
  CLIENT: faUser,
  PROVIDER: faUserTie,
  EMPLOYEE: faUserShield,
  ADMIN: faUserCog,
};

const roleAccent: Record<DemoUserSeed['role'], string> = {
  CLIENT: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  PROVIDER: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  EMPLOYEE: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  ADMIN: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
};

const persistDemoSession = (user: DemoUserSeed['user']) => {
  localStorage.setItem('token', DEMO_TOKEN);
  localStorage.setItem('user', JSON.stringify(user));
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

// ============================================
// COMPONENT
// ============================================

export const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Registration form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<DemoUserSeed['role']>('CLIENT');

  const handleQuickLogin = (seed: DemoUserSeed) => {
    persistDemoSession(seed.user);
    // Full reload so AuthProvider re-initialises cleanly
    window.location.href = '/service-connect/';
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const customUser = buildCustomDemoUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role,
    });

    persistDemoSession(customUser);
    window.location.href = '/service-connect/';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/dev-login');
  };

  return (
    <div className={styles.devLogin}>
      {/* Warning banner */}
      <div className={styles.banner}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>
          <strong>Dev only.</strong> Demo login for frontend testing. Any password
          works. This page is removed before production.
        </span>
      </div>

      {/* Current session */}
      {user && (
        <div className={styles.currentSession}>
          <div className={styles.sessionInfo}>
            <span className={styles.sessionLabel}>Currently logged in as</span>
            <span className={styles.sessionName}>
              {user.firstName} {user.lastName}
            </span>
            <span className={styles.sessionMeta}>
              {user.email} · {user.role}
            </span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      )}

      {/* Quick login */}
      <section className={styles.section}>
        <h1 className={styles.heading}>Quick login</h1>
        <p className={styles.subheading}>
          Click a role to log in instantly with a seeded demo account.
        </p>

        <div className={styles.quickGrid}>
          {DEMO_USERS.map((seed) => (
            <button
              key={seed.role}
              type="button"
              className={styles.quickCard}
              onClick={() => handleQuickLogin(seed)}
            >
              <span
                className={styles.quickIcon}
                style={{ background: roleAccent[seed.role] }}
              >
                <FontAwesomeIcon icon={roleIcon[seed.role]} />
              </span>
              <span className={styles.quickBody}>
                <span className={styles.quickRole}>{seed.role}</span>
                <span className={styles.quickName}>{seed.label}</span>
                <span className={styles.quickEmail}>{seed.user.email}</span>
              </span>
              <FontAwesomeIcon icon={faArrowRight} className={styles.quickArrow} />
            </button>
          ))}
        </div>
      </section>

      {/* Register */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Register a demo user</h2>
        <p className={styles.subheading}>
          Creates a local demo user. Nothing is sent to the backend.
        </p>

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>First name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Last name</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              placeholder="Any value — not checked in demo mode"
            />
          </label>

          <label className={styles.field}>
            <span>Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as DemoUserSeed['role'])}
            >
              <option value="CLIENT">Client</option>
              <option value="PROVIDER">Service Provider</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <button type="submit" className={styles.submitBtn}>
            Create &amp; log in
          </button>
        </form>
      </section>
    </div>
  );
};

export default DevLogin;
