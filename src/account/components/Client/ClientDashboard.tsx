// src/account/components/Client/ClientDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import type { WorkSession, Booking as BookingModel } from '../../../types';
import { demoWorkSessions } from '../../../data/demoWorkSessions';
import { demoBookings } from '../../../data/demoBookings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faHistory,
  faPlusCircle,
  faComments,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSearch,
  faBell,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardLayout, DashboardSidebar } from '../../../components/layout';
import type { SidebarNavItem } from '../../../components/layout';
import { MessagesView } from '../../../components/Chat';
import { ClockConfirmCard, ClientWorkSessionCard } from '../../../components/WorkSession';
import { getUnreadCount } from '../../../data/demoNotifications';
import styles from './ClientDashboard.module.scss';

// ============================================
// TYPES
// ============================================

interface Booking {
  id: string;
  serviceTitle: string;
  providerName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

type ClientTab = 'bookings' | 'history' | 'messages';

// ============================================
// DEMO DATA — simple list
// ============================================

const demoBookingsSimple: Booking[] = [
  { id: '1', serviceTitle: 'Plumbing Repair', providerName: 'John Doe', date: '2026-09-10T14:00:00', status: 'pending', price: 350 },
  { id: '2', serviceTitle: 'Electrical Installation', providerName: 'Jane Smith', date: '2026-09-08T09:00:00', status: 'confirmed', price: 450 },
  { id: '3', serviceTitle: 'Garden Maintenance', providerName: 'Mike Johnson', date: '2026-09-05T10:00:00', status: 'completed', price: 250 },
  { id: '4', serviceTitle: 'Renovation Project', providerName: 'Sarah Wilson', date: '2026-09-01T08:00:00', status: 'cancelled', price: 800 },
  { id: '5', serviceTitle: 'Computer Repair', providerName: 'Tom Brown', date: '2026-09-12T13:00:00', status: 'pending', price: 200 },
];

// ============================================
// CLIENT THEME CONSTANTS
// ============================================

const CLIENT_ACCENT = '#667eea';
const CLIENT_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const CLIENT_HOVER_BG = 'rgba(102, 126, 234, 0.08)';
const CLIENT_ACTIVE_BG = 'rgba(102, 126, 234, 0.12)';
const CLIENT_ROLE_BG = 'rgba(102, 126, 234, 0.1)';

const DEMO_CLIENT_ID = 'c-001';

// ============================================
// COMPONENT
// ============================================

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<ClientTab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  const [expandedConfirmBookingId, setExpandedConfirmBookingId] = useState<string | null>(null);

  // ------------------------------------------
  // Load demo data
  // ------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setBookings(demoBookingsSimple);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ------------------------------------------
  // Rich bookings for this client
  // ------------------------------------------
  const richBookings: BookingModel[] = useMemo(
    () => demoBookings.filter((b) => b.clientId === DEMO_CLIENT_ID),
    []
  );

  // ------------------------------------------
  // Actions
  // ------------------------------------------
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSidebarNavigate = (key: string) => {
    if (key === 'new') {
      navigate('/services');
      return;
    }
    setActiveTab(key as ClientTab);
  };

  const handleConfirmArrival = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'confirmed',
          updatedAt: new Date().toISOString(),
          clockEvents: s.clockEvents.map((e, idx, arr) => {
            if (e.type === 'in' && idx === arr.length - 1) {
              return { ...e, confirmedByClient: true };
            }
            return e;
          }),
        };
      })
    );
    setExpandedConfirmBookingId(null);
  };

  const handleDenyArrival = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              currentReferenceCode: undefined,
              referenceCodeExpiresAt: undefined,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
    setExpandedConfirmBookingId(null);
  };

  // ------------------------------------------
  // Simple bookings helpers
  // ------------------------------------------
  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <FontAwesomeIcon icon={faClock} />;
      case 'confirmed':
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faTimesCircle} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusClass = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredBookings = (() => {
    if (activeTab === 'history') {
      return bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');
    }
    return bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  })();

  const activeCount = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  ).length;

  const unreadMessages = getUnreadCount(DEMO_CLIENT_ID);

  // ------------------------------------------
  // Sidebar nav items
  // ------------------------------------------
  const navItems: SidebarNavItem[] = [
    { key: 'bookings', label: 'Services Requested', icon: faClipboardList, badge: activeCount },
    { key: 'history', label: 'History', icon: faHistory },
    {
      key: 'messages',
      label: 'Messages',
      icon: faComments,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    { key: 'new', label: 'Request New Service', icon: faPlusCircle },
  ];

  // ------------------------------------------
  // Arrival banners
  // ------------------------------------------
  const arrivedSessions = useMemo(() => {
    return richBookings
      .map((b) => {
        const session = sessions.find((s) => s.bookingId === b.id);
        return session && session.status === 'arrived'
          ? { booking: b, session }
          : null;
      })
      .filter((x): x is { booking: BookingModel; session: WorkSession } => !!x);
  }, [richBookings, sessions]);

  const renderArrivalSection = () => {
    if (arrivedSessions.length === 0) return null;

    return (
      <div className={styles.arrivalBanners}>
        {arrivedSessions.map(({ booking, session }) => {
          const isExpanded = expandedConfirmBookingId === booking.id;
          return (
            <div key={session.id} className={styles.arrivalBanner}>
              <button
                type="button"
                className={styles.arrivalToggle}
                onClick={() =>
                  setExpandedConfirmBookingId(isExpanded ? null : booking.id)
                }
              >
                <FontAwesomeIcon icon={faBell} className={styles.arrivalBell} />
                <span className={styles.arrivalText}>
                  <strong>{booking.providerDisplayName}</strong> is at your gate —
                  confirm access
                </span>
                <FontAwesomeIcon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  className={styles.arrivalChevron}
                />
              </button>

              {isExpanded && (
                <div className={styles.arrivalCardWrapper}>
                  <ClockConfirmCard
                    session={session}
                    providerName={booking.providerDisplayName}
                    onConfirm={handleConfirmArrival}
                    onDeny={handleDenyArrival}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ------------------------------------------
  // Active work sessions (5b)
  // ------------------------------------------
  const activeSessions = useMemo(() => {
    return richBookings
      .map((b) => {
        const session = sessions.find((s) => s.bookingId === b.id);
        if (!session) return null;
        // Active = arrived, confirmed, or in_progress
        if (
          session.status === 'arrived' ||
          session.status === 'confirmed' ||
          session.status === 'in_progress'
        ) {
          return { booking: b, session };
        }
        return null;
      })
      .filter((x): x is { booking: BookingModel; session: WorkSession } => !!x);
  }, [richBookings, sessions]);

  const renderActiveWorkSection = () => {
    if (activeSessions.length === 0) return null;

    return (
      <div className={styles.activeWorkList}>
        <div className={styles.activeWorkHeader}>
          <h3>Active work</h3>
          <p>Live updates from your service providers.</p>
        </div>

        {activeSessions.map(({ booking, session }) => (
          <ClientWorkSessionCard
            key={session.id}
            session={session}
            booking={booking}
          />
        ))}
      </div>
    );
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------
  const renderContent = () => {
    if (activeTab === 'messages') {
      return (
        <div className={styles.mainContent}>
          <MessagesView viewerRole="CLIENT" />
        </div>
      );
    }

    return (
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h2>
            {activeTab === 'bookings' && 'Your Service Requests'}
            {activeTab === 'history' && 'Request History'}
          </h2>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search requests..."
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Arrivals (always on top) */}
        {activeTab === 'bookings' && renderArrivalSection()}

        {/* Active work sessions */}
        {activeTab === 'bookings' && renderActiveWorkSection()}

        {/* Booking list */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading your requests...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <h3>
              No {activeTab === 'bookings' ? 'pending' : 'completed'} requests
            </h3>
            <p>
              {activeTab === 'bookings'
                ? 'You have no pending service requests. Browse services to get started!'
                : 'Your completed and cancelled requests will appear here.'}
            </p>
            <button
              className={styles.browseBtn}
              onClick={() => navigate('/services')}
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingTitle}>
                    <h4>{booking.serviceTitle}</h4>
                    <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
                <div className={styles.bookingDetails}>
                  <div className={styles.bookingInfo}>
                    <span className={styles.infoLabel}>Provider:</span>
                    <span className={styles.infoValue}>{booking.providerName}</span>
                  </div>
                  <div className={styles.bookingInfo}>
                    <span className={styles.infoLabel}>Date:</span>
                    <span className={styles.infoValue}>{formatDate(booking.date)}</span>
                  </div>
                  <div className={styles.bookingInfo}>
                    <span className={styles.infoLabel}>Price:</span>
                    <span className={styles.infoValue}>R{booking.price.toLocaleString()}</span>
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <div className={styles.bookingActions}>
                    <button className={styles.cancelBtn}>Cancel</button>
                    <button className={styles.contactBtn}>Contact Provider</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <DashboardLayout
        mobileTitle="My Dashboard"
        sidebar={
          <DashboardSidebar
            avatarGradient={CLIENT_GRADIENT}
            accentColor={CLIENT_ACCENT}
            hoverBg={CLIENT_HOVER_BG}
            activeBg={CLIENT_ACTIVE_BG}
            roleBg={CLIENT_ROLE_BG}
            roleColor={CLIENT_ACCENT}
            roleLabel="Client"
            navItems={navItems}
            activeKey={activeTab}
            onNavigate={handleSidebarNavigate}
            onLogout={handleLogout}
          />
        }
      >
        {renderContent()}
      </DashboardLayout>
    </div>
  );
};

export default ClientDashboard;
