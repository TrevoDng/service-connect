// src/account/components/Auth/RoleSelector.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RoleSelector.module.scss';

const RoleSelector: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Shop our products and manage your orders',
      icon: '🛍️',
      path: '/login',
      color: '#3b82f6'
    },
    {
      id: 'employee',
      title: 'Employee',
      description: 'Access your employee portal and manage tasks',
      icon: '👔',
      path: '/login/employee',
      color: '#10b981'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'System management and user approvals',
      icon: '⚙️',
      path: '/login/admin',
      color: '#ef4444'
    }
  ];

  return (
    <div className={styles.roleSelector}>
      <div className={styles.roleSelectorContainer}>
        <div className={styles.roleSelectorHeader}>
          <h1 className={styles.roleSelectorTitle}>Welcome Back</h1>
          <p className={styles.roleSelectorSubtitle}>Select your account type to continue</p>
        </div>

        <div className={styles.roleSelectorGrid}>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className={styles.roleCard}
              style={{ 
                borderTopColor: role.color,
                '--card-accent': role.color 
              } as React.CSSProperties}
            >
              <div 
                className={styles.roleCardIcon}
                style={{ backgroundColor: `${role.color}10` }}
              >
                <span>{role.icon}</span>
              </div>
              <h3 className={styles.roleCardTitle}>{role.title}</h3>
              <p className={styles.roleCardDescription}>{role.description}</p>
              <div className={styles.roleCardArrow}>→</div>
            </button>
          ))}
        </div>

        <div className={styles.roleSelectorFooter}>
          <p>Don't have an account? <a href="/register">Register as Customer</a></p>
          <p className={styles.textSm}>
            Employees: Contact your administrator for registration code
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
