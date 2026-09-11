// src/components/layout/DashboardSidebar.tsx

import React from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './DashboardSidebar.module.scss';

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: IconDefinition;
  badge?: number | string;
  disabled?: boolean;
}

export interface DashboardSidebarProps {
  /** CSS gradient string used for the avatar background and active rail */
  avatarGradient: string;
  /** Accent hex used for hover text/icon, active text/icon, focus ring */
  accentColor: string;
  /** rgba() background for hovered nav items */
  hoverBg: string;
  /** rgba() background for the active nav item */
  activeBg: string;
  /** rgba() background for the role badge */
  roleBg: string;
  /** Hex color for the role badge text */
  roleColor: string;
  /** e.g. "Administrator" | "Employee" | "Client" | "Service Provider" */
  roleLabel: string;
  /** Nav items to render */
  navItems: SidebarNavItem[];
  /** The currently active nav key */
  activeKey: string;
  /** Called when a nav item is clicked */
  onNavigate: (key: string) => void;
  /** Called when Logout is clicked */
  onLogout: () => void;
  /** Drawer mode - when true, shows a close button in the header */
  isDrawer?: boolean;
  /** Called when the drawer should close (mobile only) */
  onClose?: () => void;
  /** Optional className passthrough */
  className?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  avatarGradient,
  accentColor,
  hoverBg,
  activeBg,
  roleBg,
  roleColor,
  roleLabel,
  navItems,
  activeKey,
  onNavigate,
  onLogout,
  isDrawer = false,
  onClose,
  className = '',
}) => {
  const { user } = useAuth();

  const getInitials = (): string => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getFullName = (): string => {
    if (!user) return 'User';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first} ${last}`.trim() || 'User';
  };

  const handleNavClick = (key: string) => {
    onNavigate(key);
    // In drawer mode, close the drawer after a nav selection
    if (isDrawer && onClose) {
      onClose();
    }
  };

  const sidebarStyle: React.CSSProperties = {
    // CSS custom properties consumed by the module SCSS
    ['--sidebar-accent' as any]: accentColor,
    ['--sidebar-hover-bg' as any]: hoverBg,
    ['--sidebar-active-bg' as any]: activeBg,
    ['--sidebar-avatar-gradient' as any]: avatarGradient,
    ['--sidebar-role-bg' as any]: roleBg,
    ['--sidebar-role-color' as any]: roleColor,
  };

  return (
    <aside className={`${styles.sidebar} ${className}`} style={sidebarStyle}>
      {/* Header: avatar + name + role + email */}
      <div className={styles.sidebarHeader}>
        {isDrawer && onClose && (
          <button
            type="button"
            className={styles.drawerClose}
            onClick={onClose}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        <div className={styles.avatar}>{getInitials()}</div>

        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{getFullName()}</h3>
          <span className={styles.userRole}>{roleLabel}</span>
          <p className={styles.userEmail}>{user?.email || ''}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleNavClick(item.key)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null && (
                <span className={styles.badge}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: logout */}
      <div className={styles.sidebarFooter}>
        <button type="button" className={styles.logoutBtn} onClick={onLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
