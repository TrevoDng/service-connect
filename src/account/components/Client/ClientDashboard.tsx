// src/account/components/Client/ClientDashboard.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import {
  notifyGateConfirmed,
  notifyGateDenied,
  notifyPriceAccepted,
  notifyPriceCountered,
} from '../../../utils/notify';
import type { WorkSession, Booking as BookingModel, Dispute } from '../../../types';
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
import { addLocalDispute, addDisputeMessage } from '../../../utils/localDisputes';
import { setBookingOverride } from '../../../utils/localBookingOverrides';
import { faGavel } from '@fortawesome/free-solid-svg-icons';
import { DisputesView } from '../../../components/Disputes';
import { getOpenDisputeCountForUser } from '../../../utils/allDisputes';
import { getLocalWorkSessions } from '../../../utils/localWorkSessions';
import { updateLocalWorkSession } from '../../../utils/localWorkSessions';
import { updateGateEvent } from '../../../utils/localWorkSessions';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import styles from './ClientDashboard.module.scss';
import { bookingService } from '../../../services/booking.service';

// ============================================
// THEME CONSTANTS
// ============================================

const CLIENT_ACCENT = '#667eea';
const CLIENT_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const CLIENT_HOVER_BG = 'rgba(102, 126, 234, 0.08)';
const CLIENT_ACTIVE_BG = 'rgba(102, 126, 234, 0.12)';
const CLIENT_ROLE_BG = 'rgba(102, 126, 234, 0.1)';

//const DEMO_CLIENT_ID = 'c-001';

// ============================================
// TYPES
// ============================================

type ClientTab = 'requests' | 'history' | 'messages' | 'support';

// ============================================
// COMPONENT
// ============================================

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { add } = useNotifications();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const clientId = user?.id || '';

  const [searchParams, setSearchParams] = useSearchParams();
const threadIdFromUrl = searchParams.get('thread');
const tabFromUrl = searchParams.get('tab');

const VALID_CLIENT_TABS: ClientTab[] = [
  'requests',
  'history',
  'messages',
  'support',
];

// Derive active tab from the URL. Missing/invalid → default to 'requests'.
const activeTab: ClientTab = VALID_CLIENT_TABS.includes(
  tabFromUrl as ClientTab
)
  ? (tabFromUrl as ClientTab)
  : 'requests';

const [searchQuery, setSearchQuery] = useState('');


  // Local work sessions (Step 5b) — mutable for gate confirmation
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  const [expandedConfirmBookingId, setExpandedConfirmBookingId] = useState<string | null>(null);
  const [reviewRefresh, setReviewRefresh] = useState(0);
const [bookingRefresh, setBookingRefresh] = useState(0);

// When the URL gains/changes a ?thread= param, switch to Messages.
  // This covers the case where the dashboard is already mounted and
  // the user clicks "Chat with X" from a provider profile — the route
  // changes but the component doesn't remount.

  useEffect(() => {
    if (threadIdFromUrl && activeTab !== 'messages') {
      // Thread deep-link always lands on Messages.
      setSearchParams(
        { tab: 'messages', thread: threadIdFromUrl },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadIdFromUrl]);


// Sessions waiting for the client to confirm the gate code
const pendingWorkGates = useMemo(() => {
  return sessions.filter((s) => {
    if (s.clientId !== clientId) return false;
    if (s.gateConfirmedByClient) return false;
    if (s.gateEvent?.status === 'confirmed_late') return false;
    if (s.gateEvent?.status === 'contested') return false;
    return true;
  });
}, [sessions, clientId]);


 const handleConfirmWorkGate = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  try {
    await bookingService.confirmGate(session.bookingId);
    const booking = allClientBookings.find((b) => b.id === session.bookingId);
    if (booking) add(notifyGateConfirmed(booking));
    setBookingRefresh((t) => t + 1);
  } catch (err) {
    console.error('[confirm-work-gate] failed', err);
  }
};

 const handleDenyWorkGate = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  try {
    await bookingService.denyGate(session.bookingId);
    const booking = allClientBookings.find((b) => b.id === session.bookingId);
    if (booking) add(notifyGateDenied(booking));
    setBookingRefresh((t) => t + 1);
  } catch (err) {
    console.error('[deny-work-gate] failed', err);
  }
};

 const handleRetroactiveConfirm = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  try {
    await bookingService.retroactiveResponse(session.bookingId, 'confirm');
    const booking = allClientBookings.find((b) => b.id === session.bookingId);
    if (booking) add(notifyGateConfirmed(booking, true));
    setBookingRefresh((t) => t + 1);
  } catch (err) {
    console.error('[retro-confirm] failed', err);
  }
};

const handleRetroactiveDispute = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  const booking = allClientBookings.find((b) => b.id === session.bookingId);
  if (!booking) return;

  // Notify backend that gate is contested
  try {
    await bookingService.retroactiveResponse(session.bookingId, 'dispute');
  } catch (err) {
    console.warn('[retro-dispute] backend failed', err);
  }

  // Create local dispute record (moves to backend in Phase 6)
  const now = new Date().toISOString();
  const dispute: Dispute = {
    id: generateId(),
    bookingId: booking.id,
    requestRef: booking.requestRef,
    raisedByUserId: booking.clientId,
    raisedByRole: 'CLIENT',
    raisedByDisplayName: booking.clientDisplayName,
    againstUserId: booking.providerId,
    againstRole: 'PROVIDER',
    againstDisplayName: booking.providerDisplayName,
    category: 'no_show',
    reason:
      'Provider proceeded with the job without my gate confirmation. See the recorded gate event for details.',
    photos: [],
    status: 'open',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  addLocalDispute(dispute);
  addDisputeMessage(dispute.id, {
    authorId: 'system',
    authorDisplayName: 'ServiceConnect',
    authorRole: 'SYSTEM',
    text: 'Automatically created from a disputed gate confirmation. Our support team will review this and reach out to both parties.',
    internal: false,
  });

  setBookingRefresh((t) => t + 1);
};

  // ------------------------------------------
  // Bookings from the merged store
  // ------------------------------------------
  const [allClientBookings, setAllClientBookings] = useState<BookingModel[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const hasLoadedBookingsRef = useRef(false);

useEffect(() => {
  let cancelled = false;
  (async () => {
    if (!clientId) {
      setAllClientBookings([]);
      setLoadingBookings(false);
      return;
    }
    if (!hasLoadedBookingsRef.current) setLoadingBookings(true);
    const data = await bookingService.getMyBookings(clientId);
    if (!cancelled) {
      setAllClientBookings(data);
      setLoadingBookings(false);
      hasLoadedBookingsRef.current = true;
    }
  })();
  return () => {
    cancelled = true;
  };
}, [clientId, reviewRefresh, bookingRefresh, activeTab]);

  // Load work sessions for all bookings that could have one
useEffect(() => {
  let cancelled = false;
  (async () => {
    // Only fetch sessions for bookings that could have one
    const candidates = allClientBookings.filter(
      (b) =>
        b.workSessionId ||
        b.status === 'price_agreed' ||
        b.status === 'in_progress' ||
        b.status === 'completed'
    );
    if (candidates.length === 0) {
      setSessions([]);
      return;
    }
    const loaded: WorkSession[] = [];
    for (const b of candidates) {
      const s = await bookingService.getClientWorkSession(b.id);
      if (s) loaded.push(s);
    }
    if (!cancelled) setSessions(loaded);
  })();
  return () => { cancelled = true; };
}, [allClientBookings, bookingRefresh]);

// Auto-refresh every 10s while the tab is visible
useEffect(() => {
  const id = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      setBookingRefresh((t) => t + 1);
    }
  }, 10_000);
  return () => window.clearInterval(id);
}, []);

// Refresh immediately when the tab regains focus
useEffect(() => {
  const onFocus = () => {
    if (document.visibilityState === 'visible') {
      setBookingRefresh((t) => t + 1);
    }
  };
  document.addEventListener('visibilitychange', onFocus);
  window.addEventListener('focus', onFocus);
  return () => {
    document.removeEventListener('visibilitychange', onFocus);
    window.removeEventListener('focus', onFocus);
  };
}, []);

  // ------------------------------------------
  // Sidebar counts
  // ------------------------------------------
  const currentCount = allClientBookings.filter(isCurrentRequest).length;
  const unreadMessages = getUnreadCount(clientId);

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
  // Write the tab to the URL so notifications / back-button work.
  // Drop ?thread= when leaving messages.
  const next: Record<string, string> = { tab: key };
  if (key === 'messages' && threadIdFromUrl) {
    next.thread = threadIdFromUrl;
  }
  setSearchParams(next, { replace: false });
};

  const handleConfirmArrival = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  try {
    await bookingService.confirmGate(session.bookingId);
    const booking = allClientBookings.find((b) => b.id === session.bookingId);
    if (booking) add(notifyGateConfirmed(booking));
    setExpandedConfirmBookingId(null);
    setBookingRefresh((t) => t + 1);
  } catch (err) {
    console.error('[confirm-arrival] failed', err);
  }
};

const handleDenyArrival = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  try {
    await bookingService.denyGate(session.bookingId);
    const booking = allClientBookings.find((b) => b.id === session.bookingId);
    if (booking) add(notifyGateDenied(booking));
    setExpandedConfirmBookingId(null);
    setBookingRefresh((t) => t + 1);
  } catch (err) {
    console.error('[deny-arrival] failed', err);
  }
};

  // ------------------------------------------
  // RequestCard callbacks (stubs wired in 7e / 7h)
  // ------------------------------------------
  const handlePayConsultation = (booking: BookingModel) => {
  navigate(`/bookings/${booking.id}/consultation`);
};

  
    const handleAcceptFinalPrice = async (booking: BookingModel) => {
    const now = new Date().toISOString();

    setAllClientBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              status: 'price_agreed' as const,
              pendingCounterParty: undefined,
              holdFirm: false,
              updatedAt: now,
            }
          : b
      )
    );

    try {
      await bookingService.acceptFinalPrice(booking.id);
      add(notifyPriceAccepted({ ...booking, status: 'price_agreed' }));
    } catch (err) {
      console.warn('[accept-price] backend failed', err);
    }
    setBookingRefresh((t) => t + 1);
  };

  const handleCounterFinalPrice = async (
    booking: BookingModel,
    amount: number,
    note: string
  ) => {
    const now = new Date().toISOString();

    setAllClientBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              finalPrice: amount,
              pendingCounterParty: 'PROVIDER' as const,
              holdFirm: false,
              updatedAt: now,
            }
          : b
      )
    );

    try {
      await bookingService.counterPrice(booking.id, amount, note);
      add(
        notifyPriceCountered(
          { ...booking, pendingCounterParty: 'PROVIDER' },
          amount
        )
      );
    } catch (err) {
      console.warn('[counter-price] backend failed', err);
    }
    setBookingRefresh((t) => t + 1);
  };

    const handleDisputeFinalPrice = async (
    booking: BookingModel,
    reason: string
  ) => {
    const now = new Date().toISOString();

    setAllClientBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              status: 'price_disputed' as const,
              pendingCounterParty: undefined,
              holdFirm: false,
              updatedAt: now,
            }
          : b
      )
    );

    try {
      await bookingService.disputePrice(booking.id, reason);
    } catch (err) {
      console.warn('[dispute-price] backend failed', err);
    }
    setBookingRefresh((t) => t + 1);
  };

    const handleClientHoldFirm = async (booking: BookingModel) => {
    const now = new Date().toISOString();
    const lastClientProposal = booking.priceHistory
      ?.filter((h) => h.byUserId === booking.clientId)
      ?.slice(-1)[0];
    const firmAmount = lastClientProposal?.amount ?? booking.finalPrice ?? 0;

    setAllClientBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              pendingCounterParty: 'PROVIDER' as const,
              holdFirm: true,
              finalPrice: firmAmount,
              updatedAt: now,
            }
          : b
      )
    );

    try {
        await bookingService.clientHoldFirm(booking.id);
    } catch (err) {
      console.warn('[client-hold-firm] backend failed', err);
    }
    setBookingRefresh((t) => t + 1);
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
    {
  key: 'support',
  label: 'Support',
  icon: faGavel,
  badge: getOpenDisputeCountForUser(clientId) || undefined,
},
  ];

  // ------------------------------------------
// Work gate section (Step 13.3)
// ------------------------------------------
const renderWorkGateSection = () => {
  if (pendingWorkGates.length === 0) return null;

  return (
    <div className={styles.arrivalBanners}>
      {pendingWorkGates.map((session) => {
  const booking = allClientBookings.find(
    (b) => b.id === session.bookingId
  );
  if (!booking) return null;

  const wasAutoProceeded = session.gateEvent?.status === 'auto_proceeded';

  return (
    <div key={session.id} className={styles.arrivalBanner}>
      <div className={styles.workGateInner}>
        <div className={styles.workGateLeft}>
          <FontAwesomeIcon
            icon={wasAutoProceeded ? faExclamationTriangle : faKey}
            className={styles.arrivalBell}
          />
          <div>
            <strong>
              {wasAutoProceeded
                ? `${booking.providerDisplayName} started work without your confirmation`
                : `${booking.providerDisplayName} is at your gate`}
            </strong>
            <span className={styles.arrivalText}>
              {wasAutoProceeded ? (
                <>
                  They proceeded on{' '}
                  <strong>
                    {session.gateEvent?.resolvedAt
                      ? new Date(session.gateEvent.resolvedAt).toLocaleString('en-ZA')
                      : '—'}
                  </strong>
                  . You can confirm this was fine, or dispute it.
                </>
              ) : (
                <>
                  To start work on <strong>{booking.serviceTitle}</strong>.
                  Confirm only if the code matches.
                </>
              )}
            </span>
          </div>
        </div>

        {/* Show the code when not yet resolved */}
        {!wasAutoProceeded && session.currentReferenceCode && (
          <div className={styles.workGateCodeBox}>
            <span className={styles.workGateLabel}>Reference code</span>
            <span className={styles.workGateCode}>
              {session.currentReferenceCode}
            </span>
          </div>
        )}

        {/* Note from provider when they auto-proceeded */}
        {wasAutoProceeded && session.gateEvent?.note && (
          <div className={styles.workGateNote}>
            <strong>Note from provider:</strong>
            <span>{session.gateEvent.note}</span>
          </div>
        )}

        <div className={styles.workGateActions}>
          {wasAutoProceeded ? (
            <>
              <button
                type="button"
                className={styles.workGateConfirm}
                onClick={() => handleRetroactiveConfirm(session.id)}
              >
                Confirm — this was fine
              </button>
              <button
                type="button"
                className={styles.workGateDeny}
                onClick={() => handleRetroactiveDispute(session.id)}
              >
                Dispute
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.workGateConfirm}
                onClick={() => handleConfirmWorkGate(session.id)}
              >
                Confirm &amp; grant access
              </button>
              <button
                type="button"
                className={styles.workGateDeny}
                onClick={() => handleDenyWorkGate(session.id)}
              >
                This isn't my provider
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
})}
    </div>
  );
};

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

    if (activeTab === 'support') {
  return (
    <div className={styles.mainContent}>
      <DisputesView viewerRole="CLIENT" />
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

	{/* Work gate banners (requests tab only) */}
        {isRequests && renderWorkGateSection()}

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
                onHoldFirm={handleClientHoldFirm}
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
