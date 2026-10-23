// src/components/Requests/ProviderRequestsView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking, Notification } from '../../types';
import {
  getBookingsForProvider,
  isCurrentRequest,
  isClosedRequest,
  getBookingById,
} from '../../utils/allBookings';
import { getLocalWorkSessions } from '../../utils/localWorkSessions';
import { setBookingOverride } from '../../utils/localBookingOverrides';
import { useNotifications } from '../../account/context/NotificationContext';
import {
  notifyPriceProposed,
  notifyCounterAccepted,
  notifyHoldFirm,
} from '../../utils/notify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faHardHat,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { RequestCard } from './RequestCard';
import { generateId } from '../../utils/referenceCode';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../account/context/AuthContext';
import styles from './ProviderRequestsView.module.scss';

// ============================================
// CONFIG
// ============================================

//const DEMO_PROVIDER_ID = 'p-001';

// Default consultation fee per service category (ZAR)
const CONSULTATION_FEE_BY_CATEGORY: Record<string, number> = {
  Plumbing: 100,
  Electrical: 150,
  Gardening: 100,
  Cleaning: 100,
  Roofing: 200,
  Renovation: 300,
  Painting: 100,
  Building: 250,
  Handyman: 100,
  Technology: 100,
};
const DEFAULT_CONSULTATION_FEE = 150;

const getConsultationFeeFor = (category: string): number =>
  CONSULTATION_FEE_BY_CATEGORY[category] ?? DEFAULT_CONSULTATION_FEE;

type Tab = 'current' | 'closed';

// ============================================
// COMPONENT
// ============================================

export const ProviderRequestsView: React.FC = () => {
  const navigate = useNavigate();
  const { add } = useNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [reviewRefresh, setReviewRefresh] = useState(0);
    const { user } = useAuth();
  const providerId = user?.id || '';

  // ------------------------------------------
  // Load provider bookings (with overrides applied)
  // ------------------------------------------
    // Backend-driven bookings (Phase 1)
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBookings(true);
      const data = await bookingService.getProviderBookings(providerId);
      if (!cancelled) {
        setProviderBookings(data);
        setLoadingBookings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [providerId, refreshTick]);

  const currentRequests = providerBookings.filter(isCurrentRequest);
  const closedRequests = providerBookings.filter(isClosedRequest);

  // ------------------------------------------
  // Search filter
  // ------------------------------------------
  const applySearch = (list: Booking[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (b) =>
        b.serviceTitle.toLowerCase().includes(q) ||
        b.clientDisplayName.toLowerCase().includes(q) ||
        b.requestRef.toLowerCase().includes(q)
    );
  };

  const visibleList = applySearch(
    activeTab === 'current' ? currentRequests : closedRequests
  );

  // ------------------------------------------
  // Resumable work sessions (Step 13.3)
  // ------------------------------------------
  const resumableSessions = useMemo(
    () =>
      getLocalWorkSessions().filter((s) => {
        if (s.providerId !== providerId) return false;
        const b = getBookingById(s.bookingId);
        if (!b) return false;
        return b.status === 'price_agreed' || b.status === 'in_progress';
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshTick]
  );

  // ------------------------------------------
  // Notification helpers
  // ------------------------------------------
  const notifyClient = (notification: Notification) => {
    add(notification);
  };

  // ------------------------------------------
  // Actions
  // ------------------------------------------
    const handleAccept = async (booking: Booking) => {
    const fee = getConsultationFeeFor(booking.serviceCategory);
    const now = new Date().toISOString();

    try {
      await bookingService.acceptBooking(booking.id, fee);
    } catch (err) {
      console.warn('[accept] backend failed, using local override', err);
      setBookingOverride(booking.id, {
        status: 'accepted',
        consultationFee: fee,
        updatedAt: now,
      });
    }

    // Optimistic update so the UI doesn't flicker while the effect refetches
    setProviderBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'accepted' as const, consultationFee: fee, updatedAt: now }
          : b
      )
    );

    // Notify the client
    notifyClient({
      id: generateId(),
      userId: booking.clientId,
      type: 'booking_accepted',
      priority: 'high',
      title: 'Request accepted',
      message: `${booking.providerDisplayName} accepted your request for ${booking.serviceTitle}. Pay the consultation fee of R${fee} to schedule the site visit.`,
      linkTo: '/client/dashboard?tab=requests',
      actorId: booking.providerId,
      actorDisplayName: booking.providerDisplayName,
      bookingId: booking.id,
      createdAt: now,
    });

    setRefreshTick((t) => t + 1);
  };

    const handleDecline = async (booking: Booking) => {
    const reason = window.prompt(
      `Why are you declining "${booking.serviceTitle}"? (the client will see this)`,
      ''
    );
    if (reason === null) return; // user cancelled the prompt

    const trimmed =
      reason.trim() ||
      'Unable to take this job at the moment. Best of luck finding another provider.';
    const now = new Date().toISOString();

    try {
      await bookingService.declineBooking(booking.id, trimmed);
    } catch (err) {
      console.warn('[decline] backend failed, using local override', err);
      setBookingOverride(booking.id, {
        status: 'declined',
        declineReason: trimmed,
        updatedAt: now,
      });
    }

    // Optimistic update
    setProviderBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'declined' as const, declineReason: trimmed, updatedAt: now }
          : b
      )
    );

    // Notify the client
    notifyClient({
      id: generateId(),
      userId: booking.clientId,
      type: 'booking_declined',
      priority: 'normal',
      title: 'Request declined',
      message: `${booking.providerDisplayName} declined your request for ${booking.serviceTitle}. Reason: ${trimmed}`,
      linkTo: '/client/dashboard?tab=requests',
      actorId: booking.providerId,
      actorDisplayName: booking.providerDisplayName,
      bookingId: booking.id,
      createdAt: now,
    });

    setRefreshTick((t) => t + 1);
  };

  const handleViewOutcomes = (booking: Booking) => {
    navigate(`/bookings/${booking.id}/outcomes`);
  };

  const handleViewWorkSession = (booking: Booking) => {
    console.log('[7x TODO] Open work session for', booking.id);
  };

  const handleOpen = (booking: Booking) => {
    console.log('[7x TODO] Open request detail for', booking.id);
  };

  const handleProposeFinalPrice = (
  booking: Booking,
  amount: number,
  note: string
) => {
  const now = new Date().toISOString();

  setBookingOverride(booking.id, {
    status: 'price_proposed',
    finalPrice: amount,
    holdFirm: false,
    pendingCounterParty: 'CLIENT',
    priceHistory: [
      ...booking.priceHistory,
      {
        stage: 'final_proposed',
        amount,
        at: now,
        byUserId: booking.providerId,
        note: note || undefined,
      },
    ],
    updatedAt: now,
  });

  // Notify the client that a final price is proposed
  add(
    notifyPriceProposed(
      { ...booking, status: 'price_proposed', finalPrice: amount },
      amount
    )
  );

  setRefreshTick((t) => t + 1);
};

  const handleAcceptCounter = (booking: Booking) => {
  const now = new Date().toISOString();

  setBookingOverride(booking.id, {
    status: 'price_agreed',
    pendingCounterParty: undefined,
    holdFirm: false,
    priceHistory: [
      ...booking.priceHistory,
      {
        stage: 'final_agreed',
        amount: booking.finalPrice ?? 0,
        at: now,
        byUserId: booking.providerId,
        note: 'Provider accepted the client counter.',
      },
    ],
    updatedAt: now,
  });

  // Notify the client that their counter was accepted
  add(
    notifyCounterAccepted({
      ...booking,
      status: 'price_agreed',
      pendingCounterParty: undefined,
      holdFirm: false,
    })
  );

  setRefreshTick((t) => t + 1);
};

  const handleHoldFirm = (booking: Booking) => {
  const now = new Date().toISOString();

  setBookingOverride(booking.id, {
    holdFirm: true,
    pendingCounterParty: 'CLIENT',
    updatedAt: now,
  });

  // Notify the client that the provider held firm
  add(notifyHoldFirm({ ...booking, holdFirm: true }));

  setRefreshTick((t) => t + 1);
};

  const handleStartConsultation = (booking: Booking) => {
    navigate(`/provider/bookings/${booking.id}/consultation`);
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------

  // Resume work session banner
  const renderResumeSection = () => {
    if (resumableSessions.length === 0) return null;

    return (
      <div className={styles.resumeSection}>
        {resumableSessions.map((session) => {
          const booking = getBookingById(session.bookingId);
          if (!booking) return null;
          const gateConfirmed = session.gateConfirmedByClient === true;

          return (
            <button
              key={session.id}
              type="button"
              className={styles.resumeBanner}
              onClick={() =>
                navigate(`/provider/bookings/${booking.id}/start-work`)
              }
            >
              <div className={styles.resumeIcon}>
                <FontAwesomeIcon icon={faHardHat} />
              </div>
              <div className={styles.resumeBody}>
                <span className={styles.resumeTitle}>
                  Continue work session
                </span>
                <span className={styles.resumeMeta}>
                  {booking.serviceTitle} · {booking.clientDisplayName}
                </span>
                <span
                  className={`${styles.resumeStatus} ${
                    gateConfirmed ? styles.resumeReady : styles.resumeWaiting
                  }`}
                >
                  {gateConfirmed
                    ? 'Cleared to clock in'
                    : 'Waiting for client to confirm your code'}
                </span>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className={styles.resumeArrow}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.view}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Requests</h2>
          <p className={styles.subtitle}>
            Incoming jobs and past bookings from clients.
          </p>
        </div>

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

      {/* Resume work session banner */}
      {renderResumeSection()}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${
            activeTab === 'current' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('current')}
        >
          Current
          <span className={styles.tabCount}>{currentRequests.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${
            activeTab === 'closed' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('closed')}
        >
          Closed
          <span className={styles.tabCount}>{closedRequests.length}</span>
        </button>
      </div>

      {/* List */}
      {visibleList.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            {activeTab === 'current' ? '📬' : '📁'}
          </span>
          <h3>
            {activeTab === 'current'
              ? 'No active requests'
              : 'No closed requests'}
          </h3>
          <p>
            {activeTab === 'current'
              ? 'New requests from clients will appear here.'
              : 'Completed and declined jobs will appear here.'}
          </p>
          <button
            type="button"
            className={styles.browseBtn}
            onClick={() => navigate('/provider/dashboard')}
          >
            Back to dashboard
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {visibleList.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              viewerRole="PROVIDER"
              onAccept={handleAccept}
              onDecline={handleDecline}
              onViewOutcomes={handleViewOutcomes}
              onViewWorkSession={handleViewWorkSession}
              onStartConsultation={handleStartConsultation}
              onProposeFinalPrice={handleProposeFinalPrice}
              onAcceptCounter={handleAcceptCounter}
              onHoldFirm={handleHoldFirm}
              onReviewSubmitted={() => {
                setRefreshTick((t) => t + 1);
                setReviewRefresh((t) => t + 1);
              }}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderRequestsView;
