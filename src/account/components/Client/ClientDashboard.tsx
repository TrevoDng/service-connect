// src/account/components/Client/ClientDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import type { WorkSession, Booking as BookingModel } from '../../../types';
import { demoWorkSessions } from '../../../data/demoWorkSessions';
import { getBookingsForClient, isCurrentRequest, isClosedRequest } from '../../../utils/allBookings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faHistory,
  faPlusCircle,
  faComments,
  faSearch,
  faBell,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardLayout, DashboardSidebar } from '../../../components/layout';
import type { SidebarNavItem } from '../../../components/layout';
import { MessagesView } from '../../../components/Chat';
import { ClockConfirmCard, ClientWorkSessionCard } from '../../../components/WorkSession';
import { RequestCard } from '../../../components/Requests';
import { getUnreadCount } from '../../../data/demoNotifications';
import { generateId } from '../../../utils/referenceCode';
import { setBookingOverride } from '../../../utils/localBookingOverrides';
import styles from './ClientDashboard.module.scss';

// ============================================
// THEME CONSTANTS
// ============================================

const CLIENT_ACCENT = '#667eea';
const CLIENT_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const CLIENT_HOVER_BG = 'rgba(102, 126, 234, 0.08)';
const CLIENT_ACTIVE_BG = 'rgba(102, 126, 234, 0.12)';
const CLIENT_ROLE_BG = 'rgba(102, 126, 234, 0.1)';

const DEMO_CLIENT_ID = 'c-001';

// ============================================
// TYPES
// ============================================

type ClientTab = 'requests' | 'history' | 'messages';

// ============================================
// COMPONENT
// ============================================

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<ClientTab>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  // Local work sessions (Step 5b) — mutable for gate confirmation
  const [sessions, setSessions] = useState<WorkSession[]>(() =>
    demoWorkSessions.map((s) => ({
      ...s,
      clockEvents: [...s.clockEvents],
      beforePhotos: [...s.beforePhotos],
      progressStages: s.progressStages.map((st) => ({ ...st, photos: [...st.photos] })),
      finalPhotos: [...s.finalPhotos],
    }))
  );

  const [expandedConfirmBookingId, setExpandedConfirmBookingId] = useState<string | null>(null);
  const [reviewRefresh, setReviewRefresh] = useState(0);

  // ------------------------------------------
  // Bookings from the merged store
  // ------------------------------------------
  const allClientBookings = useMemo(
  () => getBookingsForClient(DEMO_CLIENT_ID),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [reviewRefresh]
);

  // ------------------------------------------
  // Sidebar counts
  // ------------------------------------------
  const currentCount = allClientBookings.filter(isCurrentRequest).length;
  const unreadMessages = getUnreadCount(DEMO_CLIENT_ID);

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
  // RequestCard callbacks (stubs wired in 7e / 7h)
  // ------------------------------------------
  const handlePayConsultation = (booking: BookingModel) => {
  navigate(`/bookings/${booking.id}/consultation`);
};

  
  const handleAcceptFinalPrice = (booking: BookingModel) => {
  setBookingOverride(booking.id, {
    status: 'price_agreed',
    pendingCounterParty: undefined,
    holdFirm: false,
    priceHistory: [
      ...booking.priceHistory,
      {
        stage: 'final_agreed',
        amount: booking.finalPrice ?? 0,
        at: new Date().toISOString(),
        byUserId: booking.clientId,
        note: 'Client accepted the final price.',
      },
    ],
    updatedAt: new Date().toISOString(),
  });
  // Force re-read of bookings
  setSessions((prev) => [...prev]);
};

const handleCounterFinalPrice = (
  booking: BookingModel,
  amount: number,
  note: string
) => {
  setBookingOverride(booking.id, {
    finalPrice: amount,
    holdFirm: false,
    pendingCounterParty: 'PROVIDER',
    priceHistory: [
      ...booking.priceHistory,
      {
        stage: 'final_proposed',
        amount,
        at: new Date().toISOString(),
        byUserId: booking.clientId,
        note: note ? `Client counter: ${note}` : 'Client counter.',
      },
    ],
    updatedAt: new Date().toISOString(),
  });
  setSessions((prev) => [...prev]);
};

const handleDisputeFinalPrice = (
  booking: BookingModel,
  reason: string
) => {
  setBookingOverride(booking.id, {
    status: 'price_disputed',
    pendingCounterParty: undefined,
    declineReason: undefined,
    updatedAt: new Date().toISOString(),
    priceHistory: [
      ...booking.priceHistory,
      {
        stage: 'final_proposed',
        amount: booking.finalPrice ?? booking.suggestedPrice,
        at: new Date().toISOString(),
        byUserId: booking.clientId,
        note: `Disputed: ${reason}`,
      },
    ],
  });
  setSessions((prev) => [...prev]);
};
  

  const handleViewOutcomes = (booking: BookingModel) => {
  navigate(`/bookings/${booking.id}/outcomes`);
};

  const handleViewWorkSession = (booking: BookingModel) => {
    // For now — nothing else to do. In a later step we may scroll to the
    // active work card above, or open a dedicated session page.
    console.log('[7x TODO] Open work session for', booking.id);
  };

  // ------------------------------------------
  // Filtered lists
  // ------------------------------------------
  const filteredCurrent = useMemo(() => {
    let list = allClientBookings.filter(isCurrentRequest);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.serviceTitle.toLowerCase().includes(q) ||
          b.providerDisplayName.toLowerCase().includes(q) ||
          b.requestRef.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allClientBookings, searchQuery]);

  const filteredClosed = useMemo(() => {
    let list = allClientBookings.filter(isClosedRequest);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.serviceTitle.toLowerCase().includes(q) ||
          b.providerDisplayName.toLowerCase().includes(q) ||
          b.requestRef.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allClientBookings, searchQuery]);

  // ------------------------------------------
  // Arrival banners (Step 4d)
  // ------------------------------------------
  const arrivedSessions = useMemo(() => {
    return allClientBookings
      .map((b) => {
        const session = sessions.find((s) => s.bookingId === b.id);
        return session && session.status === 'arrived'
          ? { booking: b, session }
          : null;
      })
      .filter((x): x is { booking: BookingModel; session: WorkSession } => !!x);
  }, [allClientBookings, sessions]);

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
                  <strong>{booking.providerDisplayName}</strong> is at your gate — confirm access
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
  // Active work (Step 5b)
  // ------------------------------------------
  const activeSessions = useMemo(() => {
    return allClientBookings
      .map((b) => {
        const session = sessions.find((s) => s.bookingId === b.id);
        if (!session) return null;
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
  }, [allClientBookings, sessions]);

  const renderActiveWorkSection = () => {
    if (activeSessions.length === 0) return null;

    return (
      <div className={styles.activeWorkList}>
        <div className={styles.activeWorkHeader}>
          <h3>Active work</h3>
          <p>Live updates from your service providers.</p>
        </div>

        {activeSessions.map(({ booking, session }) => (
          <ClientWorkSessionCard key={session.id} session={session} booking={booking} />
        ))}
      </div>
    );
  };

  // ------------------------------------------
  // Sidebar nav items
  // ------------------------------------------
  const navItems: SidebarNavItem[] = [
    {
      key: 'requests',
      label: 'Requests',
      icon: faClipboardList,
      badge: currentCount || undefined,
    },
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
  // Render content
  // ------------------------------------------
  const renderContent = () => {
    if (activeTab === 'messages') {
      return (
        <div className={styles.mainContent}>
          <MessagesView viewerRole="CLIENT" />
        </div>
      );
    }

    const isRequests = activeTab === 'requests';
    const list = isRequests ? filteredCurrent : filteredClosed;

    return (
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.contentHeader}>
          <h2>{isRequests ? 'Your Requests' : 'Request History'}</h2>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Arrival banners (requests tab only) */}
        {isRequests && renderArrivalSection()}

        {/* Active work (requests tab only) */}
        {isRequests && renderActiveWorkSection()}

        {/* Requests list */}
        {list.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{isRequests ? '📭' : '📁'}</span>
            <h3>
              {isRequests ? 'No active requests' : 'No past requests yet'}
            </h3>
            <p>
              {isRequests
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
          <div className={styles.requestsList}>
            {list.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                viewerRole="CLIENT"
                onPayConsultation={handlePayConsultation}
                onAcceptFinalPrice={handleAcceptFinalPrice}
                onCounterFinalPrice={handleCounterFinalPrice}
                onDisputeFinalPrice={handleDisputeFinalPrice}
                onViewOutcomes={handleViewOutcomes}
                onViewWorkSession={handleViewWorkSession}
		onReviewSubmitted={() => setReviewRefresh((t) => t + 1)}
              />
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
