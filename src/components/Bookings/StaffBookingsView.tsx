// src/components/Bookings/StaffBookingsView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import type { Booking, BookingStatus } from '../../types';
import { useAuth } from '../../account/context/AuthContext';
import { adminService, type ApiUser } from '../../services/admin.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faInbox,
  faChevronDown,
  faChevronUp,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import styles from './StaffBookingsView.module.scss';
import { StaffBookingDetailPanel } from './StaffBookingDetailPanel';

// ============================================
// PROPS
// ============================================

export interface StaffBookingsViewProps {
  viewerRole: 'ADMIN' | 'EMPLOYEE';
  /** Pre-loaded users from the parent dashboard — used for filter lookup */
  users?: ApiUser[];
}

// ============================================
// PHASE MAPPINGS
// ============================================

type MainTab = 'bookings' | 'consultations' | 'worksession';

const BOOKING_SUBTABS = ['new', 'accepted', 'payed', 'declined'] as const;
type BookingSubTab = typeof BOOKING_SUBTABS[number];

const CONSULT_SUBTABS = ['waiting', 'active', 'completed'] as const;
type ConsultSubTab = typeof CONSULT_SUBTABS[number];

const WORK_SUBTABS = ['new_jobs', 'active', 'completed', 'closed', 'complaints'] as const;
type WorkSubTab = typeof WORK_SUBTABS[number];

const BOOKING_SUBTAB_LABELS: Record<BookingSubTab, string> = {
  new: 'New',
  accepted: 'Accepted',
  payed: 'Payed',
  declined: 'Declined',
};

const CONSULT_SUBTAB_LABELS: Record<ConsultSubTab, string> = {
  waiting: 'Waiting',
  active: 'Active',
  completed: 'Completed',
};

const WORK_SUBTAB_LABELS: Record<WorkSubTab, string> = {
  new_jobs: 'New jobs',
  active: 'Active',
  completed: 'Completed work',
  closed: 'Closed',
  complaints: 'Complaints',
};

// ============================================
// HELPERS
// ============================================

const matchesBookingSubTab = (b: Booking, sub: BookingSubTab): boolean => {
  switch (sub) {
    case 'new': return b.status === 'requested';
    case 'accepted': return b.status === 'accepted';
    case 'payed': return b.status === 'consultation_paid';
    case 'declined': return b.status === 'declined';
  }
};

const matchesConsultSubTab = (b: Booking, sub: ConsultSubTab): boolean => {
  switch (sub) {
    case 'waiting': return b.status === 'consultation_paid' && !b.consultationClockIn;
    case 'active': return b.status === 'consultation_paid' && !!b.consultationClockIn;
    case 'completed':
      return (
        b.status === 'evaluated' ||
        b.status === 'price_proposed' ||
        b.status === 'price_disputed'
      );
  }
};

const matchesWorkSubTab = (b: Booking, sub: WorkSubTab): boolean => {
  switch (sub) {
    case 'new_jobs': return b.status === 'price_agreed';
    case 'active': return b.status === 'in_progress';
    case 'completed':
      return b.status === 'completed' && !b.clientConfirmedComplete && !b.hasComplaint;
    case 'closed': return b.status === 'completed' && !!b.clientConfirmedComplete;
    case 'complaints': return !!b.hasComplaint;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatPrice = (value?: number | null) => {
  if (value === undefined || value === null) return '—';
  return `R${value.toLocaleString('en-ZA')}`;
};

// ============================================
// COMPONENT
// ============================================

export const StaffBookingsView: React.FC<StaffBookingsViewProps> = ({
  viewerRole,
  users: usersFromParent,
}) => {
  const { user } = useAuth();

  const [mainTab, setMainTab] = useState<MainTab>('bookings');
  const [bookingSubTab, setBookingSubTab] = useState<BookingSubTab>('new');
  const [consultSubTab, setConsultSubTab] = useState<ConsultSubTab>('waiting');
  const [workSubTab, setWorkSubTab] = useState<WorkSubTab>('new_jobs');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const users = usersFromParent ?? [];

  // ------------------------------------------
  // Fetch bookings
  // ------------------------------------------
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getAllBookings();
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, refreshTick]);

  // ------------------------------------------
  // User lookup for filters
  // ------------------------------------------
  const userMap = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  const matchesUserFilter = (
    userId: string,
    filter: string,
    includeCompany: boolean
  ): boolean => {
    if (!filter.trim()) return true;
    const u = userMap.get(userId);
    if (!u) return true; // unknown user — don't hide
    const q = filter.toLowerCase();
    const nameMatch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
    const emailMatch = u.email.toLowerCase().includes(q);
    const companyMatch =
      includeCompany && u.companyName
        ? u.companyName.toLowerCase().includes(q)
        : false;
    return nameMatch || emailMatch || companyMatch;
  };

  // ------------------------------------------
  // Filtering (per tab)
  // ------------------------------------------
  const applyFilters = (list: Booking[]): Booking[] => {
    let result = list;
    if (clientFilter.trim()) {
      result = result.filter((b) => matchesUserFilter(b.clientId, clientFilter, false));
    }
    if (providerFilter.trim()) {
      result = result.filter((b) => matchesUserFilter(b.providerId, providerFilter, true));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.requestRef.toLowerCase().includes(q) ||
          b.serviceTitle.toLowerCase().includes(q) ||
          b.clientDisplayName.toLowerCase().includes(q) ||
          b.providerDisplayName.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const bookingCounts = useMemo(
    () => ({
      new: bookings.filter((b) => matchesBookingSubTab(b, 'new')).length,
      accepted: bookings.filter((b) => matchesBookingSubTab(b, 'accepted')).length,
      payed: bookings.filter((b) => matchesBookingSubTab(b, 'payed')).length,
      declined: bookings.filter((b) => matchesBookingSubTab(b, 'declined')).length,
    }),
    [bookings]
  );

  const consultCounts = useMemo(
    () => ({
      waiting: bookings.filter((b) => matchesConsultSubTab(b, 'waiting')).length,
      active: bookings.filter((b) => matchesConsultSubTab(b, 'active')).length,
      completed: bookings.filter((b) => matchesConsultSubTab(b, 'completed')).length,
    }),
    [bookings]
  );

  const workCounts = useMemo(
    () => ({
      new_jobs: bookings.filter((b) => matchesWorkSubTab(b, 'new_jobs')).length,
      active: bookings.filter((b) => matchesWorkSubTab(b, 'active')).length,
      completed: bookings.filter((b) => matchesWorkSubTab(b, 'completed')).length,
      closed: bookings.filter((b) => matchesWorkSubTab(b, 'closed')).length,
      complaints: bookings.filter((b) => matchesWorkSubTab(b, 'complaints')).length,
    }),
    [bookings]
  );

  const currentList: Booking[] = useMemo(() => {
    if (mainTab === 'bookings') {
      return applyFilters(bookings.filter((b) => matchesBookingSubTab(b, bookingSubTab)));
    }
    if (mainTab === 'consultations') {
      return applyFilters(bookings.filter((b) => matchesConsultSubTab(b, consultSubTab)));
    }
    return applyFilters(bookings.filter((b) => matchesWorkSubTab(b, workSubTab)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, mainTab, bookingSubTab, consultSubTab, workSubTab, clientFilter, providerFilter, searchQuery, userMap]);

  const selectedBooking = selectedBookingId
  ? bookings.find((b) => b.id === selectedBookingId) ?? null
  : null;

if (selectedBooking) {
  return (
    <StaffBookingDetailPanel
      booking={selectedBooking}
      users={users}
      onBack={() => setSelectedBookingId(null)}
    />
  );
}

  // ------------------------------------------
  // Status badge class
  // ------------------------------------------
  const getStatusClass = (status: BookingStatus): string => {
    switch (status) {
      case 'requested': return styles.statusPending;
      case 'accepted':
      case 'consultation_paid': return styles.statusAccepted;
      case 'evaluated':
      case 'price_proposed':
      case 'price_agreed':
      case 'in_progress': return styles.statusActive;
      case 'completed': return styles.statusCompleted;
      case 'declined':
      case 'cancelled':
      case 'price_disputed': return styles.statusInactive;
      default: return '';
    }
  };

  // ------------------------------------------
  // Card renderer
  // ------------------------------------------
  const renderCard = (b: Booking) => {
    const clientUser = userMap.get(b.clientId);
    const providerUser = userMap.get(b.providerId);

    return (
      <button
        key={b.id}
        type="button"
        className={styles.card}
        onClick={() => setSelectedBookingId(b.id)}
        style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <span className={styles.cardRef}>{b.requestRef}</span>
            <h4 className={styles.cardService}>{b.serviceTitle}</h4>
            <span className={`${styles.statusBadge} ${getStatusClass(b.status)}`}>
              {b.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className={styles.cardDetails}>
          <div className={styles.cardDetail}>
            <span className={styles.detailLabel}>Client</span>
            <span className={styles.detailValue}>
              {b.clientDisplayName}
              {clientUser && (
                <span className={styles.detailSub}> · {clientUser.email}</span>
              )}
            </span>
          </div>

          <div className={styles.cardDetail}>
            <span className={styles.detailLabel}>Provider</span>
            <span className={styles.detailValue}>
              {b.providerDisplayName}
              {providerUser?.companyName && (
                <span className={styles.detailSub}> · {providerUser.companyName}</span>
              )}
            </span>
          </div>

          <div className={styles.cardDetail}>
            <span className={styles.detailLabel}>Category</span>
            <span className={styles.detailValue}>{b.serviceCategory}</span>
          </div>

          <div className={styles.cardDetail}>
            <span className={styles.detailLabel}>Requested for</span>
            <span className={styles.detailValue}>{formatDate(b.requestedDate)}</span>
          </div>

          <div className={styles.cardDetail}>
            <span className={styles.detailLabel}>Suggested</span>
            <span className={styles.detailValue}>{formatPrice(b.suggestedPrice)}</span>
          </div>

          {b.finalPrice !== undefined && b.finalPrice !== null && (
            <div className={styles.cardDetail}>
              <span className={styles.detailLabel}>Final</span>
              <span className={styles.detailValue}>{formatPrice(b.finalPrice)}</span>
            </div>
          )}

          {b.consultationFee > 0 && (
            <div className={styles.cardDetail}>
              <span className={styles.detailLabel}>Consultation fee</span>
              <span className={styles.detailValue}>
                {formatPrice(b.consultationFee)}
                {b.consultationPaidAt && (
                  <span className={styles.detailSub}> · paid</span>
                )}
              </span>
            </div>
          )}

          {b.hasComplaint && (
            <div className={styles.cardDetail}>
              <span className={styles.detailLabel}>Flag</span>
              <span className={`${styles.detailValue} ${styles.flagComplaint}`}>
                ⚠️ Complaint raised
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------
  const mainTabs: { key: MainTab; label: string }[] = [
    { key: 'bookings', label: 'Bookings' },
    { key: 'consultations', label: 'Consultations' },
    { key: 'worksession', label: 'Worksession' },
  ];

  return (
    <div className={styles.view}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>All bookings</h2>
          <p className={styles.subtitle}>
            Read-only view across every client and provider on the platform.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search ref, service, party…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            type="button"
            className={`${styles.filterToggle} ${filtersOpen ? styles.filterToggleActive : ''}`}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <FontAwesomeIcon icon={faFilter} />
            Filters
            <FontAwesomeIcon icon={filtersOpen ? faChevronUp : faChevronDown} />
          </button>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => setRefreshTick((t) => t + 1)}
            title="Refresh"
          >
            <FontAwesomeIcon icon={faSync} />
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Client (name or email)</label>
            <input
              type="text"
              className={styles.filterInput}
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              placeholder="e.g. Trevor or trevor@…"
            />
          </div>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Provider (name, email, or company)</label>
            <input
              type="text"
              className={styles.filterInput}
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              placeholder="e.g. Jane, jane@…, or Acme Plumbing"
            />
          </div>
          <button
            type="button"
            className={styles.clearFilters}
            onClick={() => {
              setClientFilter('');
              setProviderFilter('');
              setSearchQuery('');
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main tabs */}
      <div className={styles.mainTabs}>
        {mainTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.mainTabBtn} ${mainTab === t.key ? styles.mainTabActive : ''}`}
            onClick={() => setMainTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className={styles.subTabs}>
        {mainTab === 'bookings' &&
          BOOKING_SUBTABS.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`${styles.subTabBtn} ${bookingSubTab === sub ? styles.subTabActive : ''}`}
              onClick={() => setBookingSubTab(sub)}
            >
              {BOOKING_SUBTAB_LABELS[sub]}
              <span className={styles.subTabCount}>{bookingCounts[sub]}</span>
            </button>
          ))}
        {mainTab === 'consultations' &&
          CONSULT_SUBTABS.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`${styles.subTabBtn} ${consultSubTab === sub ? styles.subTabActive : ''}`}
              onClick={() => setConsultSubTab(sub)}
            >
              {CONSULT_SUBTAB_LABELS[sub]}
              <span className={styles.subTabCount}>{consultCounts[sub]}</span>
            </button>
          ))}
        {mainTab === 'worksession' &&
          WORK_SUBTABS.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`${styles.subTabBtn} ${workSubTab === sub ? styles.subTabActive : ''}`}
              onClick={() => setWorkSubTab(sub)}
            >
              {WORK_SUBTAB_LABELS[sub]}
              <span className={styles.subTabCount}>{workCounts[sub]}</span>
            </button>
          ))}
      </div>

      {/* List */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading bookings…</p>
        </div>
      ) : error ? (
        <div className={styles.errorBox}><p>{error}</p></div>
      ) : currentList.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faInbox} className={styles.emptyIcon} />
          <h3>Nothing here</h3>
          <p>
            {searchQuery || clientFilter || providerFilter
              ? 'No bookings match your filters.'
              : 'Bookings will appear here once they reach this stage.'}
          </p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {currentList.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default StaffBookingsView;