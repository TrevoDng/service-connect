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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faPlusCircle,
  faComments,
  faSearch,
  faBell,
  faChevronDown,
  faChevronUp,
  faHardHat,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardLayout, DashboardSidebar } from '../../../components/layout';
import type { SidebarNavItem } from '../../../components/layout';
import { MessagesView } from '../../../components/Chat';
import { ClockConfirmCard, ClientWorkSessionCard } from '../../../components/WorkSession';
import { RequestCard } from '../../../components/Requests';
import { getUnreadCount } from '../../../data/demoNotifications';
import { faGavel } from '@fortawesome/free-solid-svg-icons';
import { DisputesView } from '../../../components/Disputes';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import styles from './ClientDashboard.module.scss';
import { bookingService } from '../../../services/booking.service';
import { disputeService } from '../../../services/dispute.service';

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

type ClientTab = 'consultations' | 'requests' | 'worksession' | 'messages' | 'support';
type ConsultSubTab = 'not_started' | 'active' | 'completed';
type RequestSubTab = 'new' | 'accepted' | 'payed' | 'declined';

const getConsultationSubTab = (status: BookingModel['status']): ConsultSubTab => {
  if (status === 'requested' || status === 'accepted') return 'not_started';
  if (status === 'consultation_paid') return 'active';
  return 'completed';
};

const REQUEST_SUBTAB_STATUS: Record<RequestSubTab, BookingModel['status']> = {
  new: 'requested',
  accepted: 'accepted',
  payed: 'consultation_paid',
  declined: 'declined',
};

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
    'consultations',
    'requests',
    'worksession',
    'messages',
    'support',
  ];

  // Derive active tab from the URL. Missing/invalid → default to 'requests'.
  const activeTab: ClientTab = VALID_CLIENT_TABS.includes(
    tabFromUrl as ClientTab
  )
    ? (tabFromUrl as ClientTab)
    : 'consultations';

  const [searchQuery, setSearchQuery] = useState('');
  const [consultSubTab, setConsultSubTab] = useState<ConsultSubTab>('active');
  const [requestSubTab, setRequestSubTab] = useState<RequestSubTab>('new');
  type WorkSubTab = 'new_jobs' | 'active' | 'completed';
  const [workSubTab, setWorkSubTab] = useState<WorkSubTab>('active');
    const [selectedWorkSessionBookingId, setSelectedWorkSessionBookingId] = useState<string | null>(null);

  useEffect(() => {
    setConsultSubTab('active');
    setRequestSubTab('new');
    setSelectedWorkSessionBookingId(null);
  }, [activeTab]);

  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [bookingRefresh, setBookingRefresh] = useState(0);

  // Local work sessions (Step 5b) — mutable for gate confirmation
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  const [openDisputeCount, setOpenDisputeCount] = useState(0);

useEffect(() => {
  if (!clientId) { setOpenDisputeCount(0); return; }
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
}, [clientId, bookingRefresh, reviewRefresh]);

  const [expandedConfirmBookingId, setExpandedConfirmBookingId] = useState<string | null>(null);
  

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

  // Contest the gate event
  try {
    await bookingService.retroactiveResponse(session.bookingId, 'dispute');
  } catch (err) {
    console.warn('[retro-dispute] gate update failed', err);
  }

  // Raise a real dispute via backend
  try {
    await disputeService.raiseDispute(booking.id, {
      category: 'no_show',
      reason:
        'Provider proceeded with the job without my gate confirmation. See the recorded gate event for details.',
    });
  } catch (err) {
    console.warn('[retro-dispute] raise failed', err);
  }

  setBookingRefresh((t) => t + 1);
};

const handleReportSuspicious = async (sessionId: string) => {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  const booking = allClientBookings.find((b) => b.id === session.bookingId);
  if (!booking) return;

  try {
    await bookingService.denyGate(session.bookingId);
  } catch (err) {
    console.warn('[report-suspicious] deny failed', err);
  }

  try {
    await disputeService.raiseDispute(booking.id, {
      category: 'no_show',
      reason: 'Someone arrived claiming to be my provider with an invalid code. Denied access and reporting to support.',
    });
  } catch (err) {
    console.warn('[report-suspicious] raise failed', err);
  }

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
  const requestCount = allClientBookings.filter(
    (b) => b.status === 'requested' || b.status === 'accepted'
  ).length;

  const consultationCount = allClientBookings.filter(
    (b) =>
      b.status === 'consultation_paid' ||
      b.status === 'evaluated' ||
      b.status === 'price_proposed' ||
      b.status === 'price_disputed'
  ).length;

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
  const filteredByPhase = useMemo(() => {
    const isConsultations = activeTab === 'consultations';
    const isRequests = activeTab === 'requests';

    let list = allClientBookings;

    if (isConsultations) {
      list = list.filter((b) => getConsultationSubTab(b.status) === consultSubTab);
    } else {
      // Default to request filter — anything reaching here (post early returns)
      // is the requests tab
      list = list.filter((b) => b.status === REQUEST_SUBTAB_STATUS[requestSubTab]);
    }

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
  }, [allClientBookings, searchQuery, activeTab, consultSubTab, requestSubTab]);

  const consultSubCounts = useMemo(() => {
    const counts: Record<ConsultSubTab, number> = { not_started: 0, active: 0, completed: 0 };
    allClientBookings.forEach((b) => {
      counts[getConsultationSubTab(b.status)]++;
    });
    return counts;
  }, [allClientBookings]);

  const requestSubCounts = useMemo(() => {
    const counts: Record<RequestSubTab, number> = { new: 0, accepted: 0, payed: 0, declined: 0 };
    allClientBookings.forEach((b) => {
      if (b.status === 'requested') counts.new++;
      else if (b.status === 'accepted') counts.accepted++;
      else if (b.status === 'consultation_paid') counts.payed++;
      else if (b.status === 'declined') counts.declined++;
    });
    return counts;
  }, [allClientBookings]);


  const workBookings = allClientBookings.filter(
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
                  <code style={{ marginRight: 8, opacity: 0.7, fontSize: '0.85em' }}>
                    {booking.requestRef}
                  </code>
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
    key: 'consultations',
    label: 'Consultations',
    icon: faComments,
    badge: consultationCount || undefined,
  },
  {
    key: 'requests',
    label: 'Requests',
    icon: faClipboardList,
    badge: requestCount || undefined,
  },
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
    badge: openDisputeCount || undefined,
  },
  {
    key: 'worksession',
    label: 'Worksession',
    icon: faHardHat,
    badge: workSubCounts.active || undefined,
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
            <code style={{ display: 'block', marginBottom: 2, opacity: 0.7, fontSize: '0.8em' }}>
              {booking.requestRef}
            </code>
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

              <button
                type="button"
                className={styles.workGateDeny}
                onClick={() => handleReportSuspicious(session.id)}
              >
                Report suspicious
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
  // Render content renderWorksession
  // ------------------------------------------

const renderWorksession = () => {
  if (selectedWorkSessionBookingId) {
    const booking = allClientBookings.find((b) => b.id === selectedWorkSessionBookingId);
    const session = sessions.find((s) => s.bookingId === selectedWorkSessionBookingId);
    
    if (booking && session) {
      return (
        <div className={styles.mainContent}>
          <div className={styles.contentHeader} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setSelectedWorkSessionBookingId(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.9rem',
                padding: 0
              }}
            >
              ← Back to Worksession
            </button>
            <h2>Work Session Details</h2>
          </div>
          <ClientWorkSessionCard session={session} booking={booking} />
        </div>
      );
    }
  }

  return (
  <div className={styles.mainContent}>
    <div className={styles.contentHeader}>
      <h2>Worksession</h2>
    </div>

    <div className={styles.subTabs}>
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

    {filteredWorkBookings.length === 0 ? (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🛠️</span>
        <h3>
          {workSubTab === 'new_jobs' ? 'No new jobs'
            : workSubTab === 'active' ? 'No active work'
            : 'No completed work yet'}
        </h3>
        <p>
          {workSubTab === 'new_jobs' ? 'Agreed prices will appear here.'
            : workSubTab === 'active' ? 'Clock-ins appear here once work begins.'
            : 'Finished jobs will appear here.'}
        </p>
      </div>
    ) : (
      <div className={styles.requestsList}>
        {filteredWorkBookings.map((b) => (
          <button
            key={b.id}
            type="button"
            className={styles.sessionCard}
            onClick={() => setSelectedWorkSessionBookingId(b.id)}
            style={{ cursor: 'pointer', textAlign: 'left' }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                opacity: 0.7,
                color: 'var(--text-light, #8a8aaa)',
              }}
            >
              {b.requestRef}
            </span>
            <h4 style={{ margin: '4px 0' }}>{b.serviceTitle}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
              Provider: {b.providerDisplayName} · Status: {b.status}
            </p>
          </button>
        ))}
      </div>
    )}
  </div>
  );
};

  // ------------------------------------------
  // Render content
  // ------------------------------------------
  const renderContent = () => {
    if (activeTab === 'worksession') {
      return renderWorksession();
    }
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

    const list = filteredByPhase;
const isConsultations = activeTab === 'consultations';
const isRequests = activeTab === 'requests';

return (
  <div className={styles.mainContent}>
    {/* Header */}
    <div className={styles.contentHeader}>
      <h2>{isConsultations ? 'Consultations' : 'Requests'}</h2>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder={isConsultations ? "Search consultations..." : "Search requests..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className={styles.subTabs}>
          {isConsultations
            ? (['not_started', 'active', 'completed'] as const).map((key) => {
                const label =
                  key === 'not_started' ? 'Waiting'
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
              })
            : (['new', 'accepted', 'payed', 'declined'] as const).map((key) => {
                const label =
                  key === 'new' ? 'New'
                  : key === 'accepted' ? 'Accepted'
                  : key === 'payed' ? 'Payed'
                  : 'Declined';
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.subTabBtn} ${requestSubTab === key ? styles.subTabActive : ''}`}
                    onClick={() => setRequestSubTab(key)}
                  >
                    {label}
                    <span className={styles.subTabCount}>{requestSubCounts[key]}</span>
                  </button>
                );
              })}
        </div>

        {/* Requests list */}
        {list.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{isRequests ? '📭' : '📁'}</span>
            <h3>
              {isConsultations
                ? 'No consultations in this view'
                : requestSubTab === 'new' ? 'No new requests'
                : requestSubTab === 'accepted' ? 'No accepted requests'
                : requestSubTab === 'payed' ? 'No paid consultations'
                : 'No declined requests'}
            </h3>
            <p>
              {isConsultations
                ? 'Bookings at this stage will appear here.'
                : requestSubTab === 'new'
                ? 'Requests waiting for a provider to respond will appear here.'
                : requestSubTab === 'accepted'
                ? 'Providers who accepted your requests will appear here.'
                : requestSubTab === 'payed'
                ? 'Requests with paid consultation fees will appear here.'
                : 'Declined requests will appear here.'}
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

