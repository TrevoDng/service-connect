// src/components/layout/DashboardLayout.tsx

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import styles from './DashboardLayout.module.scss';

export interface DashboardLayoutProps {
  /** The sidebar node to render (typically <DashboardSidebar />). */
  sidebar: React.ReactNode;
  /** Main content area. */
  children: React.ReactNode;
  /**
   * Title shown in the mobile top bar (next to the hamburger).
   * On desktop this is ignored — the main content renders its own header.
   */
  mobileTitle?: string;
  /** Optional className passthrough on the outer wrapper. */
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  children,
  mobileTitle = 'Dashboard',
  className = '',
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lock body scroll while the drawer is open on mobile
  useEffect(() => {
    if (isDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isDrawerOpen]);

  // Close drawer if the viewport grows past mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDrawerOpen]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className={`${styles.dashboard} ${className}`}>
      {/* Mobile top bar with hamburger - hidden on tablet/desktop */}
      <div className={styles.mobileTopBar}>
        <button
          type="button"
          className={styles.hamburger}
          onClick={openDrawer}
          aria-label="Open menu"
          aria-expanded={isDrawerOpen}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <span className={styles.mobileTitle}>{mobileTitle}</span>
      </div>

      <div className={styles.dashboardContainer}>
        {/* Desktop / tablet sidebar (always visible above 768px) */}
        <div className={styles.sidebarDesktopSlot}>{sidebar}</div>

        {/* Mobile drawer */}
        <div
          className={`${styles.drawerOverlay} ${isDrawerOpen ? styles.drawerOverlayOpen : ''}`}
          onClick={closeDrawer}
          aria-hidden={!isDrawerOpen}
        >
          <div
            className={`${styles.drawerPanel} ${isDrawerOpen ? styles.drawerPanelOpen : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/*
              Clone the sidebar with drawer props so it knows to render
              the close button and close itself on nav click.
              We use React.cloneElement because the sidebar is a node
              passed in by the parent — this keeps DashboardLayout generic.
            */}
            {React.isValidElement(sidebar)
              ? React.cloneElement(sidebar as React.ReactElement<any>, {
                  isDrawer: true,
                  onClose: closeDrawer,
                })
              : sidebar}
          </div>
        </div>

        {/* Main content */}
        <main className={styles.mainContentSlot}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
