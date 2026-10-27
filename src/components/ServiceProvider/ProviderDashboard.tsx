// src/components/ServiceProvider/ProviderDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../account/context/AuthContext';
import { useTheme } from '../../styles/context/ThemeContext';
import { AddServiceForm } from './AddServiceForm';
import { ProviderServicesList } from './ProviderServicesList';
import { serviceService } from '../../services/service.service';
import type { ServiceStats } from '../../types/service.types';
import type { WorkSession, ProgressStage, WorkPhoto } from '../../types';
import { demoWorkSessions } from '../../data/demoWorkSessions';
import { getBookingById } from '../../utils/allBookings';
//import { getLocalWorkSessions } from '../../utils/localWorkSessions';
import {
  generateClockInCode,
  clockInCodeExpiry,
  generateId,
} from '../../utils/referenceCode';
import { formatRelative, formatDuration } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faComments,
  faHardHat,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardLayout, DashboardSidebar } from '../layout';
import type { SidebarNavItem } from '../layout';
import { MessagesView } from '../Chat';
import { WorkSessionPanel } from '../WorkSession';
import { ProviderRequestsView } from '../Requests';
import { getUnreadCount } from '../../data/demoNotifications';
import { faGavel } from '@fortawesome/free-solid-svg-icons';
import { DisputesView } from '../Disputes';
import { getOpenDisputeCountForUser } from '../../utils/allDisputes';
import { getBookingsForProvider, isCurrentRequest } from '../../utils/allBookings';
import styles from './ProviderDashboard.module.scss';
import { disputeService } from '../../services/dispute.service';

// ============================================
// THEME CONSTANTS
// ============================================

const PROVIDER_ACCENT = '#f59e0b';
const PROVIDER_GRADIENT = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
const PROVIDER_HOVER_BG = 'rgba(245, 158, 11, 0.08)';
const PROVIDER_ACTIVE_BG = 'rgba(245, 158, 11, 0.12)';
const PROVIDER_ROLE_BG = 'rgba(245, 158, 11, 0.1)';

//const DEMO_PROVIDER_ID = 'p-001';

// ============================================
// TYPES
// ============================================

type ProviderView = 'requests' | 'my-services' | 'work-log' | 'messages' | 'support';
type ServicesTab = 'list' | 'add';

// ============================================
// COMPONENT
// ============================================

export const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
const tabFromUrl = searchParams.get('tab');
const threadIdFromUrl = searchParams.get('thread');

const VALID_PROVIDER_TABS: ProviderView[] = [
  'requests',
  'my-services',
  'work-log',
  'messages',
  'support',
];

 const activeView: ProviderView = VALID_PROVIDER_TABS.includes(
  tabFromUrl as ProviderView
)
  ? (tabFromUrl as ProviderView)
  : 'requests';

const [activeTab, setActiveTab] = useState<ServicesTab>('list');

// Deep-link: a ?thread= param (from chat notifications) should force
// the Messages tab, then normalize the URL to include ?tab=messages.
// Mirrors the same effect in ClientDashboard.
useEffect(() => {
  if (threadIdFromUrl && activeView !== 'messages') {
    setSearchParams(
      { tab: 'messages', thread: threadIdFromUrl },
      { replace: true }
    );
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [threadIdFromUrl]);

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
      progressStages: s.progressStages.map((st) => ({ ...st, photos: [...st.photos] })),
      finalPhotos: [...s.finalPhotos],
    }))
  );

  const providerId = user?.id || '';

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

  const [openDisputeCount, setOpenDisputeCount] = useState(0);

useEffect(() => {
  if (!providerId) { setOpenDisputeCount(0); return; }
  let cancelled = false;
  (async () => {
    try {
      const disputes = await disputeService.getMyDisputes();
      const open = disputes.filter(
        (d) => d.status === 'open' || d.status === 'awaiting_info'
      ).length;
      if (!cancelled) setOpenDisputeCount(open);
    } catch {
      if (!cancelled) setOpenDisputeCount(0);
    }
  })();
  return () => { cancelled = true; };
}, [providerId]);

  // ------------------------------------------
  // Sidebar badge counts
  // ------------------------------------------
  const unreadMessages = getUnreadCount(providerId);
  const activeRequestCount = useMemo(
    () => getBookingsForProvider(providerId).filter(isCurrentRequest).length,
    // Recomputed each render of the dashboard — cheap enough for demo
    // and reflects any overrides written from the Requests view.
    [providerId, sessions]
  );

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
    setSearchParams({ tab: key }, { replace: false });
    setSelectedSessionId(null);
  };

  // ------------------------------------------
  // Session mutators
  // ------------------------------------------
  const updateSession = (
    sessionId: string,
    updater: (s: WorkSession) => WorkSession
  ) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updater(s) : s)));
  };

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
          (new Date(outAt).getTime() - new Date(lastIn.at).getTime()) / 3_600_000;
      }
      return {
        ...s,
        status: 'in_progress',
        currentReferenceCode: undefined,
        referenceCodeExpiresAt: undefined,
        clockEvents: [
          ...s.clockEvents,
          { id: generateId(), type: 'out', at: outAt, confirmedByClient: false },
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

  const handleSaveProgressStage = (sessionId: string, stage: ProgressStage) => {
    updateSession(sessionId, (s) => {
      const exists = s.progressStages.some((st) => st.id === stage.id);
      const nextStages = exists
        ? s.progressStages.map((st) => (st.id === stage.id ? stage : st))
        : [...s.progressStages, stage];
      return { ...s, progressStages: nextStages, updatedAt: new Date().toISOString() };
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
  // Sidebar
  // ------------------------------------------
  const navItems: SidebarNavItem[] = [
    {
      key: 'requests',
      label: 'Requests',
      icon: faInbox,
      badge: activeRequestCount || undefined,
    },
    { key: 'my-services', label: 'My Services', icon: faList },
    {
      key: 'work-log',
      label: 'Work Log',
      icon: faHardHat,
      badge:
        sessions.filter(
          (s) => s.providerId === providerId && s.status !== 'completed'
        ).length || undefined,
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: faComments,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
  key: 'support',
  label: 'Support',
  icon: faGavel,
  badge: openDisputeCount || undefined,
},
  ];

  // ------------------------------------------
  // My Services view
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
  // Requests view
  // ------------------------------------------
  const renderRequests = () => (
    <div className={styles.mainContent}>
      <ProviderRequestsView />
    </div>
  );

  // ------------------------------------------
  // Work Log view
  // ------------------------------------------
  const renderWorkLog = () => {
    if (selectedSession && selectedBooking) {
      return (
        <div className={styles.mainContent}>
          <WorkSessionPanel
            session={selectedSession}
            booking={selectedBooking}
            providerId={providerId}
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

    const providerSessions = sessions
      .filter((s) => s.providerId === providerId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
      <div className={styles.mainContent}>
        <div className={styles.workLogHeader}>
          <h2>Work Log</h2>
          <p className={styles.workLogSubtitle}>Active and recent job sessions.</p>
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
                    <span className={styles.sessionRef}>{booking.requestRef}</span>
                    <h4 className={styles.sessionTitle}>{booking.serviceTitle}</h4>
                    <p className={styles.sessionClient}>Client: {booking.clientDisplayName}</p>
                  </div>
                  <div className={styles.sessionRight}>
                    <span
                      className={`${styles.sessionStatus} ${
                        isActive ? styles.sessionStatusActive : styles.sessionStatusDone
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
  // Messages view
  // ------------------------------------------
  const renderMessages = () => (
    <div className={styles.mainContent}>
      <MessagesView viewerRole="PROVIDER" />
    </div>
  );

  const renderSupport = () => (
  <div className={styles.mainContent}>
    <DisputesView viewerRole="PROVIDER" />
  </div>
);

  // ------------------------------------------
  // Compose
  // ------------------------------------------
  const selectedSession = selectedSessionId
    ? sessions.find((s) => s.id === selectedSessionId) || null
    : null;

  const selectedBooking = selectedSession
    ? getBookingById(selectedSession.bookingId)
    : undefined;

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
        {activeView === 'requests' && renderRequests()}
        {activeView === 'my-services' && renderMyServices()}
        {activeView === 'work-log' && renderWorkLog()}
        {activeView === 'messages' && renderMessages()}
	{activeView === 'support' && renderSupport()}

      </DashboardLayout>
    </div>
  );
};

export default ProviderDashboard;
