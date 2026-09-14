// src/components/Requests/ProviderRequestsView.tsx

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../types';
import {
  getBookingsForProvider,
  isCurrentRequest,
  isClosedRequest,
} from '../../utils/allBookings';
import { setBookingOverride } from '../../utils/localBookingOverrides';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { RequestCard } from './RequestCard';
import styles from './ProviderRequestsView.module.scss';

// ============================================
// CONFIG
// ============================================

const DEMO_PROVIDER_ID = 'p-001';

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
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  // ------------------------------------------
  // Load provider bookings (with overrides applied)
  // ------------------------------------------
  const providerBookings = useMemo(
    () => getBookingsForProvider(DEMO_PROVIDER_ID),
    // refreshTick forces re-read after accept/decline
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshTick]
  );

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
  // Actions
  // ------------------------------------------
  const handleAccept = (booking: Booking) => {
    setBookingOverride(booking.id, {
      status: 'accepted',
      consultationFee: getConsultationFeeFor(booking.serviceCategory),
      updatedAt: new Date().toISOString(),
    });
    setRefreshTick((t) => t + 1);
  };

  const handleDecline = (booking: Booking) => {
    const reason = window.prompt(
      `Why are you declining "${booking.serviceTitle}"? (the client will see this)`,
      ''
    );
    if (reason === null) return; // user cancelled the prompt

    setBookingOverride(booking.id, {
      status: 'declined',
      declineReason:
        reason.trim() ||
        'Unable to take this job at the moment. Best of luck finding another provider.',
      updatedAt: new Date().toISOString(),
    });
    setRefreshTick((t) => t + 1);
  };

  const handleViewOutcomes = (booking: Booking) => {
    console.log('[7i TODO] Open outcomes for', booking.id);
  };

  const handleViewWorkSession = (booking: Booking) => {
    console.log('[7x TODO] Open work session for', booking.id);
  };

  const handleOpen = (booking: Booking) => {
    console.log('[7x TODO] Open request detail for', booking.id);
  };

  const handleProposeFinalPrice = (booking: Booking) => {
    console.log('[7h TODO] Propose final price for', booking.id);
  };

  const handleStartConsultation = (booking: Booking) => {
  navigate(`/provider/bookings/${booking.id}/consultation`);
};

  // ------------------------------------------
  // Render
  // ------------------------------------------
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
            {activeTab === 'current' ? 'No active requests' : 'No closed requests'}
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
              onProposeFinalPrice={handleProposeFinalPrice}
              onViewOutcomes={handleViewOutcomes}
              onViewWorkSession={handleViewWorkSession}
	      onStartConsultation={handleStartConsultation}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderRequestsView;
