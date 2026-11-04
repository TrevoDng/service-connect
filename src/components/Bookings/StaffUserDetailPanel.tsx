// src/components/Bookings/StaffUserDetailPanel.tsx

import React, { useEffect, useMemo, useState } from 'react';
import type { Booking, ProviderRatingSummary } from '../../types';
import type { ApiUser } from '../../services/admin.service';
import { adminService } from '../../services/admin.service';
import { reviewService } from '../../services/review.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUserShield,
  faUserCog,
  faUserTie,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faInbox,
  faStar,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';
import { StaffBookingDetailPanel } from './StaffBookingDetailPanel';
import styles from './StaffUserDetailPanel.module.scss';

// ============================================
// PROPS
// ============================================

export interface StaffUserDetailPanelProps {
  user: ApiUser;
  allUsers: ApiUser[];
  onBack: () => void;
  canApprove?: boolean;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  actionLoading?: string | null;
}

// ============================================
// HELPERS
// ============================================

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (value?: number | null) => {
  if (value === undefined || value === null) return '—';
  return `R${Number(value).toLocaleString('en-ZA')}`;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Active';
    case 'pending_email': return 'Pending email';
    case 'email_verified': return 'Email verified';
    case 'pending_approval': return 'Pending approval';
    case 'rejected': return 'Rejected';
    case 'deactivated': return 'Deactivated';
    default: return status;
  }
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'active': return styles.statusActive;
    case 'pending_email':
    case 'email_verified':
    case 'pending_approval': return styles.statusPending;
    case 'rejected':
    case 'deactivated': return styles.statusInactive;
    default: return styles.statusInactive;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN': return faUserShield;
    case 'EMPLOYEE': return faUserCog;
    case 'PROVIDER': return faUserTie;
    default: return faUsers;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'Administrator';
    case 'EMPLOYEE': return 'Employee';
    case 'PROVIDER': return 'Service Provider';
    case 'CLIENT': return 'Client';
    default: return role;
  }
};

const getInitials = (firstName: string, lastName: string) => {
  const f = firstName?.charAt(0) || '';
  const l = lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || 'U';
};

// ============================================
// COMPONENT
// ============================================

export const StaffUserDetailPanel: React.FC<StaffUserDetailPanelProps> = ({
  user,
  allUsers,
  onBack,
  canApprove = false,
  onApprove,
  onReject,
  actionLoading,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [reviewsSummary, setReviewsSummary] =
    useState<ProviderRatingSummary | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingBookings(true);
        setBookingsError(null);
        const data = await adminService.getUserBookings(user.id);
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) {
          setBookingsError(
            err instanceof Error ? err.message : 'Failed to fetch bookings'
          );
        }
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Fetch provider reviews (silent fail)
  useEffect(() => {
    if (user.role !== 'PROVIDER') return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingReviews(true);
        const { summary } = await reviewService.getReviewsForProvider(user.id);
        if (!cancelled) setReviewsSummary(summary);
      } catch {
        if (!cancelled) setReviewsSummary(null);
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id, user.role]);

  // Stats
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const cancelledDeclined = bookings.filter(
      (b) => b.status === 'cancelled' || b.status === 'declined'
    ).length;

    // Money metric: sum of finalPrice on completed bookings
    const money = bookings
      .filter((b) => b.status === 'completed' && b.finalPrice != null)
      .reduce((sum, b) => sum + Number(b.finalPrice), 0);

    return { total, completed, cancelledDeclined, money };
  }, [bookings]);

  const moneyLabel =
    user.role === 'PROVIDER' ? 'Earned (completed)' : 'Spent (completed)';

  const isPendingApproval = user.status === 'pending_approval';
  const showApprovalActions =
    canApprove &&
    isPendingApproval &&
    (user.role === 'EMPLOYEE' || user.role === 'PROVIDER');

  const selectedBooking = selectedBookingId
    ? bookings.find((b) => b.id === selectedBookingId) ?? null
    : null;

  // Booking detail overrides user detail
  if (selectedBooking) {
    return (
      <StaffBookingDetailPanel
        booking={selectedBooking}
        users={allUsers}
        onBack={() => setSelectedBookingId(null)}
      />
    );
  }

  // ------------------------------------------
  // Card renderer for this user's bookings
  // ------------------------------------------
  const renderBookingCard = (b: Booking) => {
    const otherName =
      user.role === 'PROVIDER' ? b.clientDisplayName : b.providerDisplayName;
    const otherLabel = user.role === 'PROVIDER' ? 'Client' : 'Provider';

    return (
      <button
        key={b.id}
        type="button"
        className={styles.bookingCard}
        onClick={() => setSelectedBookingId(b.id)}
      >
        <div className={styles.bookingCardTop}>
          <span className={styles.bookingRef}>{b.requestRef}</span>
          <h5 className={styles.bookingTitle}>{b.serviceTitle}</h5>
          <span className={styles.bookingStatus}>
            {b.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className={styles.bookingCardBottom}>
          <span>
            <strong>{otherLabel}:</strong> {otherName}
          </span>
          <span>
            <strong>Requested:</strong> {formatDate(b.requestedDate)}
          </span>
          {b.finalPrice != null && (
            <span>
              <strong>Final:</strong> {formatPrice(b.finalPrice)}
            </span>
          )}
        </div>
      </button>
    );
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div className={styles.panel}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to list
      </button>

      {/* Profile header */}
      <header className={styles.profileHeader}>
        <div className={styles.avatarCircle}>
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>
              {user.firstName} {user.lastName}
            </h1>
            <span className={styles.roleBadge}>
              <FontAwesomeIcon icon={getRoleIcon(user.role)} />
              {getRoleLabel(user.role)}
            </span>
            <span className={`${styles.statusBadge} ${getStatusClass(user.status)}`}>
              {getStatusLabel(user.status)}
            </span>
          </div>
          <p className={styles.emailLine}>{user.email}</p>
        </div>
      </header>

      {/* Contact / account details */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.grid}>
          {user.phone && (
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Phone</span>
              <span className={styles.gridValue}>{user.phone}</span>
            </div>
          )}
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Joined</span>
            <span className={styles.gridValue}>{formatDate(user.createdAt)}</span>
          </div>
          {user.lastLogin && (
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Last login</span>
              <span className={styles.gridValue}>{formatDateTime(user.lastLogin)}</span>
            </div>
          )}
          {user.approvedAt && (
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Approved at</span>
              <span className={styles.gridValue}>{formatDateTime(user.approvedAt)}</span>
            </div>
          )}

          {user.role === 'PROVIDER' && (
            <>
              {user.serviceType && (
                <div className={styles.gridItem}>
                  <span className={styles.gridLabel}>Service type</span>
                  <span className={styles.gridValue}>{user.serviceType}</span>
                </div>
              )}
              {user.companyName && (
                <div className={styles.gridItem}>
                  <span className={styles.gridLabel}>Company</span>
                  <span className={styles.gridValue}>{user.companyName}</span>
                </div>
              )}
              {user.registrationNumber && (
                <div className={styles.gridItem}>
                  <span className={styles.gridLabel}>Registration no.</span>
                  <span className={styles.gridValue}>{user.registrationNumber}</span>
                </div>
              )}
            </>
          )}
        </div>

        {showApprovalActions && (
          <div
            className={styles.approvalRow}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.approveBtn}
              disabled={actionLoading === user.id}
              onClick={() => onApprove?.(user.id)}
            >
              <FontAwesomeIcon icon={faCheckCircle} /> Approve
            </button>
            <button
              type="button"
              className={styles.rejectBtn}
              disabled={actionLoading === user.id}
              onClick={() => onReject?.(user.id)}
            >
              <FontAwesomeIcon icon={faTimesCircle} /> Reject
            </button>
          </div>
        )}
      </section>

      {/* Activity stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Activity</h2>
        <div className={styles.statsRow}>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total bookings</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{stats.cancelledDeclined}</span>
            <span className={styles.statLabel}>Cancelled / declined</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{formatPrice(stats.money)}</span>
            <span className={styles.statLabel}>{moneyLabel}</span>
          </div>
        </div>
      </section>

      {/* Provider review summary */}
      {user.role === 'PROVIDER' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faStar} /> Reviews
          </h2>
          {loadingReviews ? (
            <p className={styles.muted}>Loading reviews…</p>
          ) : !reviewsSummary || reviewsSummary.count === 0 ? (
            <p className={styles.muted}>No reviews yet.</p>
          ) : (
            <div className={styles.reviewsBlock}>
              <div className={styles.reviewScore}>
                <span className={styles.reviewAverage}>
                  {reviewsSummary.average?.toFixed(1) ?? '—'}
                </span>
                <span className={styles.reviewStars}>
                  {'★'.repeat(Math.round(reviewsSummary.average ?? 0))}
                </span>
                <span className={styles.reviewCount}>
                  {reviewsSummary.count} review
                  {reviewsSummary.count === 1 ? '' : 's'}
                </span>
              </div>

              {reviewsSummary.recommendRate != null && (
                <div className={styles.recommendBox}>
                  <FontAwesomeIcon icon={faThumbsUp} />
                  <span>
                    {reviewsSummary.recommendRate}% would recommend
                  </span>
                </div>
              )}

              <div className={styles.breakdown}>
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = reviewsSummary.breakdown[star];
                  const pct =
                    reviewsSummary.count > 0
                      ? Math.round((count / reviewsSummary.count) * 100)
                      : 0;
                  return (
                    <div key={star} className={styles.breakdownRow}>
                      <span className={styles.breakdownStar}>{star}★</span>
                      <div className={styles.breakdownBar}>
                        <div
                          className={styles.breakdownFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={styles.breakdownCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Bookings list */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Bookings ({bookings.length})
        </h2>

        {loadingBookings ? (
          <div className={styles.loadingSmall}>
            <div className={styles.spinner} />
            <p>Loading bookings…</p>
          </div>
        ) : bookingsError ? (
          <p className={styles.errorText}>{bookingsError}</p>
        ) : bookings.length === 0 ? (
          <div className={styles.emptyBookings}>
            <FontAwesomeIcon icon={faInbox} className={styles.emptyIcon} />
            <p>
              {user.role === 'CLIENT'
                ? 'This client has not created any bookings yet.'
                : user.role === 'PROVIDER'
                ? 'This provider has not received any bookings yet.'
                : 'Bookings do not apply to this role.'}
            </p>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {bookings.map(renderBookingCard)}
          </div>
        )}
      </section>
    </div>
  );
};

export default StaffUserDetailPanel;