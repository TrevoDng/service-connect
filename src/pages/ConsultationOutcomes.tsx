// src/pages/ConsultationOutcomes.tsx

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { getBookingById } from '../utils/allBookings';
import { canSeeConsultationFeeStatus, type ViewerRole } from '../types';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatRelative,
  formatTime,
} from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFileInvoiceDollar,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faHandshake,
  faGavel,
  faUser,
  faUserTie,
  faCamera,
  faClipboardList,
  faMapMarkedAlt,
  faKey,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ConsultationOutcomes.module.scss';

// ============================================
// HELPERS
// ============================================

const getViewerRole = (role?: string): ViewerRole => {
  if (role === 'PROVIDER' || role === 'EMPLOYEE' || role === 'ADMIN') {
    return role;
  }
  return 'CLIENT';
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'requested': return 'Awaiting provider';
    case 'accepted': return 'Accepted';
    case 'consultation_paid': return 'Consultation paid';
    case 'evaluated': return 'Site evaluated';
    case 'price_proposed': return 'Price proposed';
    case 'price_agreed': return 'Price agreed';
    case 'in_progress': return 'Work in progress';
    case 'completed': return 'Completed';
    case 'declined': return 'Declined';
    case 'cancelled': return 'Cancelled';
    case 'price_disputed': return 'Price disputed';
    default: return status;
  }
};

const statusTone = (status: string): 'success' | 'info' | 'warning' | 'danger' | 'muted' => {
  switch (status) {
    case 'completed':
    case 'price_agreed':
      return 'success';
    case 'accepted':
    case 'consultation_paid':
    case 'evaluated':
    case 'price_proposed':
    case 'in_progress':
      return 'info';
    case 'requested':
      return 'warning';
    case 'declined':
    case 'price_disputed':
      return 'danger';
    case 'cancelled':
    default:
      return 'muted';
  }
};

const stageLabel = (stage: string): string => {
  switch (stage) {
    case 'suggested': return 'Client suggested';
    case 'consultation': return 'Consultation fee paid';
    case 'final_proposed': return 'Final price proposed';
    case 'final_agreed': return 'Final price agreed';
    default: return stage;
  }
};

// ============================================
// COMPONENT
// ============================================

export const ConsultationOutcomes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const booking = useMemo(() => (id ? getBookingById(id) : undefined), [id]);
  const viewerRole = getViewerRole(user?.role);

  // ------------------------------------------
  // Guards
  // ------------------------------------------
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!booking) {
      navigate('/');
      return;
    }
    // Only allow outcomes for bookings that have progressed beyond 'requested'
    if (booking.status === 'requested') {
      if (viewerRole === 'CLIENT') navigate('/client/dashboard');
      else if (viewerRole === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, user]);

  const handleBack = () => {
    if (viewerRole === 'CLIENT') navigate('/client/dashboard');
    else if (viewerRole === 'PROVIDER') navigate('/provider/dashboard');
    else navigate(-1);
  };

  if (!booking) return null;

  const tone = statusTone(booking.status);
  const showFeeBadge = canSeeConsultationFeeStatus(viewerRole);
  const feePaid = !!booking.consultationPaidAt;
  const hasConsultationPhotos =
    booking.consultationPhotos && booking.consultationPhotos.length > 0;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        {/* Back */}
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.ref}>{booking.requestRef}</span>
            <span className={`${styles.statusBadge} ${styles[tone]}`}>
              {statusLabel(booking.status)}
            </span>
            {showFeeBadge && (
              <span
                className={`${styles.feeBadge} ${
                  feePaid ? styles.feePaid : styles.feeUnpaid
                }`}
              >
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                {feePaid ? 'Fee paid' : 'Fee unpaid'}
              </span>
            )}
          </div>
          <h1 className={styles.title}>{booking.serviceTitle}</h1>
          <p className={styles.category}>{booking.serviceCategory}</p>
          <p className={styles.updated}>
            Last update {formatRelative(booking.updatedAt)}
          </p>
        </header>

        {/* Parties */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Parties</h2>
          <div className={styles.partyGrid}>
            <div className={styles.partyCard}>
              <span className={styles.partyIcon}>
                <FontAwesomeIcon icon={faUser} />
              </span>
              <div>
                <div className={styles.partyRole}>Client</div>
                <div className={styles.partyName}>
                  {booking.clientDisplayName}
                </div>
              </div>
            </div>
            <div className={styles.partyCard}>
              <span className={styles.partyIcon}>
                <FontAwesomeIcon icon={faUserTie} />
              </span>
              <div>
                <div className={styles.partyRole}>Service Provider</div>
                <div className={styles.partyName}>
                  {booking.providerDisplayName}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Price timeline */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Price timeline
          </h2>

          <div className={styles.timeline}>
            {booking.priceHistory.map((entry, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles[`dot_${entry.stage}`]}`}>
                  {entry.stage === 'final_agreed' ? (
                    <FontAwesomeIcon icon={faHandshake} />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <div className={styles.timelineBody}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineStage}>
                      {stageLabel(entry.stage)}
                    </span>
                    <span className={styles.timelineAmount}>
                      {formatPrice(entry.amount)}
                    </span>
                  </div>
                  <div className={styles.timelineMeta}>
                    <span>{formatDateTime(entry.at)}</span>
                    {entry.note && <span>· {entry.note}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consultation findings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faMapMarkedAlt} /> Site consultation
          </h2>

          {/* Site visit summary */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Fee</span>
              <span className={styles.summaryValue}>
                {booking.consultationFee > 0
                  ? formatPrice(booking.consultationFee)
                  : '—'}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Fee paid</span>
              <span className={styles.summaryValue}>
                {booking.consultationPaidAt
                  ? formatDate(booking.consultationPaidAt)
                  : '—'}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Site visited</span>
              <span className={styles.summaryValue}>
                {booking.siteVisited ? (
                  <span className={styles.yes}>
                    <FontAwesomeIcon icon={faCheckCircle} /> Yes
                  </span>
                ) : (
                  <span className={styles.no}>
                    <FontAwesomeIcon icon={faTimesCircle} /> Not yet
                  </span>
                )}
              </span>
            </div>
            {booking.consultationClockIn && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Clocked in</span>
                <span className={styles.summaryValue}>
                  {formatTime(booking.consultationClockIn)}
                </span>
              </div>
            )}
            {booking.consultationClockOut && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Clocked out</span>
                <span className={styles.summaryValue}>
                  {formatTime(booking.consultationClockOut)}
                </span>
              </div>
            )}
          </div>

          {/* Findings notes */}
          {booking.consultationNotes && (
            <div className={styles.notesBlock}>
              <h3 className={styles.notesTitle}>
                <FontAwesomeIcon icon={faClipboardList} /> Findings
              </h3>
              <p className={styles.notes}>{booking.consultationNotes}</p>
            </div>
          )}

          {/* Consultation photos */}
          {hasConsultationPhotos && (
            <div className={styles.photosBlock}>
              <h3 className={styles.notesTitle}>
                <FontAwesomeIcon icon={faCamera} /> Site photos
              </h3>
              <div className={styles.photoGrid}>
                {booking.consultationPhotos!.map((url, i) => (
                  <figure key={i} className={styles.photoTile}>
                    <img
                      src={url}
                      alt={`Site photo ${i + 1}`}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Final price */}
        {booking.finalPrice !== undefined && (
          <section className={styles.finalCard}>
            <div className={styles.finalLabel}>
              <FontAwesomeIcon icon={faHandshake} />
              {booking.status === 'price_agreed'
                ? 'Agreed final price'
                : booking.status === 'price_disputed'
                ? 'Disputed final price'
                : 'Proposed final price'}
            </div>
            <div className={styles.finalAmount}>
              {formatPrice(booking.finalPrice)}
            </div>
            {booking.pendingCounterParty === 'PROVIDER' && (
              <p className={styles.finalHint}>
                <FontAwesomeIcon icon={faClock} /> Awaiting provider response
                to client counter.
              </p>
            )}
            {booking.pendingCounterParty === 'CLIENT' && !booking.holdFirm && (
              <p className={styles.finalHint}>
                <FontAwesomeIcon icon={faClock} /> Awaiting client response.
              </p>
            )}
            {booking.holdFirm && (
              <p className={styles.finalHint}>
                <FontAwesomeIcon icon={faGavel} /> Provider is holding firm on
                this amount.
              </p>
            )}
          </section>
        )}

        {/* Work session link */}
        {booking.workSessionId && (
          <section className={styles.workSessionCard}>
            <div className={styles.workSessionLeft}>
              <FontAwesomeIcon icon={faKey} className={styles.workSessionIcon} />
              <div>
                <strong>Work session</strong>
                <span>A live record of days worked and photos on site.</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.workSessionBtn}
              onClick={() =>
                console.log('[7x TODO] Open work session', booking.workSessionId)
              }
            >
              <FontAwesomeIcon icon={faPlay} />
              Open work session
            </button>
          </section>
        )}

        {/* Closed / declined */}
        {(booking.status === 'declined' ||
          booking.status === 'cancelled' ||
          booking.status === 'price_disputed') && (
          <section className={styles.closedCard}>
            <h3 className={styles.closedTitle}>
              <FontAwesomeIcon icon={faTimesCircle} />
              {booking.status === 'declined'
                ? 'This request was declined'
                : booking.status === 'cancelled'
                ? 'This request was cancelled'
                : 'This price is under review'}
            </h3>
            {booking.declineReason && (
              <p className={styles.closedReason}>{booking.declineReason}</p>
            )}
            {booking.status === 'price_disputed' && (
              <p className={styles.closedReason}>
                Our support team will review this dispute and reach out to both
                parties shortly.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ConsultationOutcomes;
