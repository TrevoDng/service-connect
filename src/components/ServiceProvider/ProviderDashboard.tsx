// src/components/ServiceProvider/ProviderDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../account/context/AuthContext';
import { useTheme } from '../../styles/context/ThemeContext';
import { AddServiceForm } from './AddServiceForm';
import { ProviderServicesList } from './ProviderServicesList';
import { serviceService } from '../../services/service.service';
import type { ServiceStats } from '../../types/service.types';
import type { WorkSession, ProgressStage, WorkPhoto } from '../../types';
import { demoWorkSessions } from '../../data/demoWorkSessions';
import { getBookingById } from '../../data/demoBookings';
import {
  generateClockInCode,
  clockInCodeExpiry,
  generateId,
} from '../../utils/referenceCode';
import { formatRelative, formatDuration } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faComments, faHardHat } from '@fortawesome/free-solid-svg-icons';
import { DashboardLayout, DashboardSidebar } from '../layout';
import type { SidebarNavItem } from '../layout';
import { MessagesView } from '../Chat';
import { WorkSessionPanel } from '../WorkSession';
import { getUnreadCount } from '../../data/demoNotifications';
import styles from './ProviderDashboard.module.scss';

// ============================================
// PROVIDER THEME CONSTANTS
// ============================================

const PROVIDER_ACCENT = '#f59e0b';
const PROVIDER_GRADIENT = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
const PROVIDER_HOVER_BG = 'rgba(245, 158, 11, 0.08)';
const PROVIDER_ACTIVE_BG = 'rgba(245, 158, 11, 0.12)';
const PROVIDER_ROLE_BG = 'rgba(245, 158, 11, 0.1)';

const DEMO_PROVIDER_ID = 'p-001';

// ============================================
// TYPES
// ============================================

type ProviderView = 'my-services' | 'work-log' | 'messages';
type ServicesTab = 'list' | 'add';

// ============================================
// COMPONENT
// ============================================

export const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const [activeView, setActiveView] = useState<ProviderView>('my-services');
  const [activeTab, setActiveTab] = useState<ServicesTab>('list');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  const [sessions, setSessions] = useState<WorkSession[]>(() =>
    demoWorkSessions.map((s) => ({
      ...s,
      clockEvents: [...s.clockEvents],
      beforePhotos: [...s.beforePhotos],
      progressStages: s.progressStages.map((st) => ({
        ...st,
        photos: [...st.photos],
      })),
      finalPhotos: [...s.finalPhotos],
    }))
  );

  // ------------------------------------------
  // Fetch stats
  // ------------------------------------------
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const data = await serviceService.getProviderStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // Session mutation helper
  // ------------------------------------------
  const updateSession = (
    sessionId: string,
    updater: (s: WorkSession) => WorkSession
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? updater(s) : s))
    );
  };

  // ------------------------------------------
  // Actions
  // ------------------------------------------
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTabChange = (tab: ServicesTab) => {
    setActiveTab(tab);
    if (tab === 'list') fetchStats();
  };

  const handleSidebarNavigate = (key: string) => {
    setActiveView(key as ProviderView);
    setSelectedSessionId(null);
  };

  // ------------------------------------------
  // Work log helpers
  // ------------------------------------------
  const providerSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.providerId === DEMO_PROVIDER_ID)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [sessions]
  );

  const selectedSession = selectedSessionId
    ? sessions.find((s) => s.id === selectedSessionId) || null
    : null;

  const selectedBooking = selectedSession
    ? getBookingById(selectedSession.bookingId)
    : undefined;

  // ------------------------------------------
  // Clock actions
  // ------------------------------------------
  const handleClockIn = (sessionId: string) => {
    updateSession(sessionId, (s) => {
      const code = generateClockInCode();
      const expiry = clockInCodeExpiry();
      return {
        ...s,
        status: 'arrived',
        currentReferenceCode: code,
        referenceCodeExpiresAt: expiry,
        clockEvents: [
          ...s.clockEvents,
          {
            id: generateId(),
            type: 'in',
            at: new Date().toISOString(),
            referenceCode: code,
            confirmedByClient: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleClockOut = (sessionId: string) => {
    updateSession(sessionId, (s) => {
      const lastIn = [...s.clockEvents].reverse().find((e) => e.type === 'in');
      const outAt = new Date().toISOString();

      let addedHours = 0;
      if (lastIn) {
        addedHours =
          (new Date(outAt).getTime() - new Date(lastIn.at).getTime()) /
          3_600_000;
      }

      return {
        ...s,
        status: 'in_progress',
        currentReferenceCode: undefined,
        referenceCodeExpiresAt: undefined,
        clockEvents: [
          ...s.clockEvents,
          {
            id: generateId(),
            type: 'out',
            at: outAt,
            confirmedByClient: false,
          },
        ],
        daysWorked: s.daysWorked + 1,
        totalHours: Number((s.totalHours + addedHours).toFixed(2)),
        updatedAt: outAt,
      };
    });
  };

  const handleMarkComplete = (sessionId: string) => {
    updateSession(sessionId, (s) => ({
      ...s,
      status: 'completed',
      currentReferenceCode: undefined,
      referenceCodeExpiresAt: undefined,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  // ------------------------------------------
  // Photo actions
  // ------------------------------------------
  const handleAddBeforePhotos = (sessionId: string, photos: WorkPhoto[]) => {
    updateSession(sessionId, (s) => ({
      ...s,
      beforePhotos: photos,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteBeforePhoto = (sessionId: string, photoId: string) => {
    updateSession(sessionId, (s) => ({
      ...s,
      beforePhotos: s.beforePhotos.filter((p) => p.id !== photoId),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveProgressStage = (
    sessionId: string,
    stage: ProgressStage
  ) => {
    updateSession(sessionId, (s) => {
      const exists = s.progressStages.some((st) => st.id === stage.id);
      const nextStages = exists
        ? s.progressStages.map((st) => (st.id === stage.id ? stage : st))
        : [...s.progressStages, stage];
      return {
        ...s,
        progressStages: nextStages,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeleteProgressStage = (sessionId: string, stageId: string) => {
    updateSession(sessionId, (s) => ({
      ...s,
      progressStages: s.progressStages.filter((st) => st.id !== stageId),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddFinalPhotos = (sessionId: string, photos: WorkPhoto[]) => {
    updateSession(sessionId, (s) => ({
      ...s,
      finalPhotos: photos,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteFinalPhoto = (sessionId: string, photoId: string) => {
    updateSession(sessionId, (s) => ({
      ...s,
      finalPhotos: s.finalPhotos.filter((p) => p.id !== photoId),
      updatedAt: new Date().toISOString(),
    }));
  };

  // ------------------------------------------
  // Sidebar nav items
  // ------------------------------------------
  const unreadMessages = getUnreadCount(DEMO_PROVIDER_ID);

  const navItems: SidebarNavItem[] = [
    { key: 'my-services', label: 'My Services', icon: faList },
    {
      key: 'work-log',
      label: 'Work Log',
      icon: faHardHat,
      badge:
        providerSessions.filter((s) => s.status !== 'completed').length ||
        undefined,
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: faComments,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
  ];

  // ------------------------------------------
  // Render — "My Services"
  // ------------------------------------------
  const renderMyServices = () => (
    <div className={styles.mainContent}>
      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statTotal}`}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Services</span>
                <span className={styles.statValue}>{stats.total}</span>
              </div>
              <span className={styles.statIcon}>📊</span>
            </div>
            <div className={`${styles.statCard} ${styles.statActive}`}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active</span>
                <span className={styles.statValue}>{stats.active}</span>
              </div>
              <span className={styles.statIcon}>✅</span>
            </div>
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Pending</span>
                <span className={styles.statValue}>{stats.pending}</span>
              </div>
              <span className={styles.statIcon}>⏳</span>
            </div>
            <div className={`${styles.statCard} ${styles.statBookings}`}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Bookings</span>
                <span className={styles.statValue}>{stats.completed}</span>
              </div>
              <span className={styles.statIcon}>📅</span>
            </div>
          </div>

          <div className={styles.dashboardTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
              onClick={() => handleTabChange('list')}
            >
              My Services
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
              onClick={() => handleTabChange('add')}
            >
              Add New Service
            </button>
          </div>

          <div className={styles.dashboardContent}>
            {activeTab === 'list' ? (
              <ProviderServicesList onStatsUpdate={fetchStats} />
            ) : (
              <AddServiceForm onServiceAdded={() => handleTabChange('list')} />
            )}
          </div>
        </>
      )}
    </div>
  );

  // ------------------------------------------
  // Render — "Work Log"
  // ------------------------------------------
  const renderWorkLog = () => {
    if (selectedSession && selectedBooking) {
      return (
        <div className={styles.mainContent}>
          <WorkSessionPanel
            session={selectedSession}
            booking={selectedBooking}
            providerId={DEMO_PROVIDER_ID}
            onBack={() => setSelectedSessionId(null)}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onMarkComplete={handleMarkComplete}
            workReady={selectedBooking.siteVisited}
            onAddBeforePhotos={handleAddBeforePhotos}
            onDeleteBeforePhoto={handleDeleteBeforePhoto}
            onSaveProgressStage={handleSaveProgressStage}
            onDeleteProgressStage={handleDeleteProgressStage}
            onAddFinalPhotos={handleAddFinalPhotos}
            onDeleteFinalPhoto={handleDeleteFinalPhoto}
          />
        </div>
      );
    }

    return (
      <div className={styles.mainContent}>
        <div className={styles.workLogHeader}>
          <h2>Work Log</h2>
          <p className={styles.workLogSubtitle}>
            Active and recent job sessions.
          </p>
        </div>

        {providerSessions.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🛠️</span>
            <h3>No work sessions yet</h3>
            <p>Sessions appear here once a booking is agreed and you clock in.</p>
          </div>
        ) : (
          <div className={styles.sessionList}>
            {providerSessions.map((session) => {
              const booking = getBookingById(session.bookingId);
              if (!booking) return null;
              const isActive = session.status !== 'completed';

              return (
                <button
                  key={session.id}
                  type="button"
                  className={styles.sessionCard}
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <div className={styles.sessionLeft}>
                    <span className={styles.sessionRef}>
                      {booking.requestRef}
                    </span>
                    <h4 className={styles.sessionTitle}>
                      {booking.serviceTitle}
                    </h4>
                    <p className={styles.sessionClient}>
                      Client: {booking.clientDisplayName}
                    </p>
                  </div>
                  <div className={styles.sessionRight}>
                    <span
                      className={`${styles.sessionStatus} ${
                        isActive
                          ? styles.sessionStatusActive
                          : styles.sessionStatusDone
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className={styles.sessionMeta}>
                      {session.daysWorked}d ·{' '}
                      {formatDuration(Math.round(session.totalHours * 60))}
                    </span>
                    <span className={styles.sessionMeta}>
                      {formatRelative(session.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------
  // Render — "Messages"
  // ------------------------------------------
  const renderMessages = () => (
    <div className={styles.mainContent}>
      <MessagesView viewerRole="PROVIDER" />
    </div>
  );

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <DashboardLayout
        mobileTitle="Provider Dashboard"
        sidebar={
          <DashboardSidebar
            avatarGradient={PROVIDER_GRADIENT}
            accentColor={PROVIDER_ACCENT}
            hoverBg={PROVIDER_HOVER_BG}
            activeBg={PROVIDER_ACTIVE_BG}
            roleBg={PROVIDER_ROLE_BG}
            roleColor={PROVIDER_ACCENT}
            roleLabel="Service Provider"
            navItems={navItems}
            activeKey={activeView}
            onNavigate={handleSidebarNavigate}
            onLogout={handleLogout}
          />
        }
      >
        {activeView === 'my-services' && renderMyServices()}
        {activeView === 'work-log' && renderWorkLog()}
        {activeView === 'messages' && renderMessages()}
      </DashboardLayout>
    </div>
  );
};

export default ProviderDashboard;
