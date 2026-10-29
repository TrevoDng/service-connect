// src/components/ServiceProvider/ProviderDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../account/context/AuthContext';
import { useTheme } from '../../styles/context/ThemeContext';
import { AddServiceForm } from './AddServiceForm';
import { ProviderServicesList } from './ProviderServicesList';
import { serviceService } from '../../services/service.service';
import type { ServiceStats } from '../../types/service.types';
import type { WorkSession, ProgressStage, WorkPhoto, Booking } from '../../types';
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
import { bookingService } from '../../services/booking.service';

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

type ProviderView = 'consultations' | 'requests' | 'my-services' | 'work-log' | 'messages' | 'support';
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
  'consultations',
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

    type WorkSubTab = 'new_jobs' | 'active' | 'completed';
    const [workSubTab, setWorkSubTab] = useState<WorkSubTab>('active');
    const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
    const [workRefresh, setWorkRefresh] = useState(0);

    type ConsultSubTab = 'waiting' | 'active' | 'completed';
    const [consultSubTab, setConsultSubTab] = useState<ConsultSubTab>('active');

  useEffect(() => {
    if (!providerId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await bookingService.getProviderBookings(providerId);
        if (!cancelled) setProviderBookings(data);
      } catch (err) {
        console.warn('[provider-dashboard] bookings fetch failed', err);
      }
    })();
    return () => { cancelled = true; };
  }, [providerId, workRefresh]);

  useEffect(() => {
    if (!providerId) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setWorkRefresh((t) => t + 1);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [providerId]);

  // Derived work-phase bookings
  const workBookings = providerBookings.filter(
    (b) => b.status === 'price_agreed' || b.status === 'in_progress' || b.status === 'completed'
  );
  const workSubCounts = {
    new_jobs: workBookings.filter((b) => b.status === 'price_agreed').length,
    active: workBookings.filter((b) => b.status === 'in_progress').length,
    completed: workBookings.filter((b) => b.status === 'completed').length,
  };
  const filteredWorkBookings = workBookings.filter((b) => {
    if (workSubTab === 'new_jobs') return b.status === 'price_agreed';
    if (workSubTab === 'active') return b.status === 'in_progress';
    return b.status === 'completed';
  });

    // Consultation-phase bookings (dual display with Requests→Payed)
  const consultBookings = providerBookings.filter(
    (b) =>
      b.status === 'consultation_paid' ||
      b.status === 'evaluated' ||
      b.status === 'price_proposed' ||
      b.status === 'price_disputed'
  );

  const consultSubCounts = {
    waiting: consultBookings.filter(
      (b) => b.status === 'consultation_paid' && !b.consultationClockIn
    ).length,
    active: consultBookings.filter(
      (b) => b.status === 'consultation_paid' && !!b.consultationClockIn
    ).length,
    completed: consultBookings.filter(
      (b) =>
        b.status === 'evaluated' ||
        b.status === 'price_proposed' ||
        b.status === 'price_disputed'
    ).length,
  };

  const filteredConsultBookings = consultBookings.filter((b) => {
    if (consultSubTab === 'waiting') {
      return b.status === 'consultation_paid' && !b.consultationClockIn;
    }
    if (consultSubTab === 'active') {
      return b.status === 'consultation_paid' && !!b.consultationClockIn;
    }
    return (
      b.status === 'evaluated' ||
      b.status === 'price_proposed' ||
      b.status === 'price_disputed'
    );
  });

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
      key: 'consultations',
      label: 'Consultations',
      icon: faComments,
      badge:
        consultBookings.filter(
          (b) =>
            b.status === 'consultation_paid' ||
            b.status === 'price_proposed'
        ).length || undefined,
    },
    {
      key: 'requests',
      label: 'Requests',
      icon: faInbox,
      badge: activeRequestCount || undefined,
    },
    { key: 'my-services', label: 'My Services', icon: faList },
    {
      key: 'work-log',
      label: 'Worksession',
      icon: faHardHat,
      badge: workSubCounts.active || undefined,
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
  // Consultations view
  // ------------------------------------------
  const renderConsultations = () => (
    <div className={styles.mainContent}>
      <div className={styles.workLogHeader}>
        <h2>Consultations</h2>
        <p className={styles.workLogSubtitle}>Site visits and price negotiations.</p>
      </div>

      <div className={styles.worksessionSubTabs}>
        {(['waiting', 'active', 'completed'] as const).map((key) => {
          const label =
            key === 'waiting' ? 'Waiting'
            : key === 'active' ? 'Active'
            : 'Completed';
          return (
            <button
              key={key}
              type="button"
              className={`${styles.subTabBtn} ${consultSubTab === key ? styles.subTabActive : ''}`}
              onClick={() => setConsultSubTab(key)}
            >
              {label}
              <span className={styles.subTabCount}>{consultSubCounts[key]}</span>
            </button>
          );
        })}
      </div>

      {filteredConsultBookings.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <h3>
            {consultSubTab === 'waiting'
              ? 'No consultations waiting'
              : consultSubTab === 'active'
              ? 'No active consultations'
              : 'No completed consultations'}
          </h3>
          <p>
            {consultSubTab === 'waiting'
              ? 'Paid consultations waiting to start will appear here.'
              : consultSubTab === 'active'
              ? 'Consultations in progress (clocked in) will appear here.'
              : 'Finished consultations and price negotiations will appear here.'}
          </p>
        </div>
      ) : (
        <div className={styles.sessionList}>
          {filteredConsultBookings.map((b) => (
            <button
              key={b.id}
              type="button"
              className={styles.sessionCard}
              onClick={() => navigate(`/provider/bookings/${b.id}/consultation`)}
            >
              <div className={styles.sessionLeft}>
                <span className={styles.sessionRef}>{b.requestRef}</span>
                <h4 className={styles.sessionTitle}>{b.serviceTitle}</h4>
                <p className={styles.sessionClient}>Client: {b.clientDisplayName}</p>
              </div>
              <div className={styles.sessionRight}>
                <span
                  className={`${styles.sessionStatus} ${
                    b.status === 'evaluated' ||
                    b.status === 'price_proposed' ||
                    b.status === 'price_disputed'
                      ? styles.sessionStatusDone
                      : styles.sessionStatusActive
                  }`}
                >
                  {b.status === 'consultation_paid' && !b.consultationClockIn
                    ? 'Ready to visit'
                    : b.status === 'consultation_paid'
                    ? 'Visit in progress'
                    : b.status === 'evaluated'
                    ? 'Awaiting price proposal'
                    : b.status === 'price_proposed'
                    ? 'Negotiating'
                    : 'Price disputed'}
                </span>
                <span className={styles.sessionMeta}>
                  {b.status === 'price_proposed' && b.finalPrice !== undefined
                    ? `R${b.finalPrice} proposed`
                    : b.status === 'evaluated'
                    ? 'Consultation done'
                    : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
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
  const renderWorksession = () => (
    <div className={styles.mainContent}>
      <div className={styles.workLogHeader}>
        <h2>Worksession</h2>
        <p className={styles.workLogSubtitle}>Jobs that have passed consultation.</p>
      </div>

      {/* Sub-tabs */}
      <div className={styles.worksessionSubTabs}>
        {(['new_jobs', 'active', 'completed'] as const).map((key) => {
          const label =
            key === 'new_jobs' ? 'New Jobs'
            : key === 'active' ? 'Active'
            : 'Completed Work';
          return (
            <button
              key={key}
              type="button"
              className={`${styles.subTabBtn} ${workSubTab === key ? styles.subTabActive : ''}`}
              onClick={() => setWorkSubTab(key)}
            >
              {label}
              <span className={styles.subTabCount}>{workSubCounts[key]}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filteredWorkBookings.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🛠️</span>
          <h3>
            {workSubTab === 'new_jobs'
              ? 'No new jobs'
              : workSubTab === 'active'
              ? 'No active work'
              : 'No completed work yet'}
          </h3>
          <p>
            {workSubTab === 'new_jobs'
              ? 'Jobs with agreed prices will appear here.'
              : workSubTab === 'active'
              ? 'Clock-ins appear here once work begins.'
              : 'Finished jobs will appear here.'}
          </p>
        </div>
      ) : (
        <div className={styles.sessionList}>
          {filteredWorkBookings.map((b) => (
            <button
              key={b.id}
              type="button"
              className={styles.sessionCard}
              onClick={() => navigate(`/provider/bookings/${b.id}/start-work`)}
            >
              <div className={styles.sessionLeft}>
                <span className={styles.sessionRef}>{b.requestRef}</span>
                <h4 className={styles.sessionTitle}>{b.serviceTitle}</h4>
                <p className={styles.sessionClient}>Client: {b.clientDisplayName}</p>
              </div>
              <div className={styles.sessionRight}>
                <span
                  className={`${styles.sessionStatus} ${
                    b.status === 'completed'
                      ? styles.sessionStatusDone
                      : styles.sessionStatusActive
                  }`}
                >
                  {b.status}
                </span>
                <span className={styles.sessionMeta}>
                  {b.status === 'price_agreed'
                    ? 'Ready to start'
                    : b.status === 'in_progress'
                    ? 'In progress'
                    : 'Completed'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

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
        {activeView === 'consultations' && renderConsultations()}
        {activeView === 'requests' && renderRequests()}
        {activeView === 'my-services' && renderMyServices()}
        {activeView === 'work-log' && renderWorksession()}
        {activeView === 'messages' && renderMessages()}
	{activeView === 'support' && renderSupport()}

      </DashboardLayout>
    </div>
  );
};

export default ProviderDashboard;
