// src/components/Bookings/StaffBookingDetailPanel.tsx

import React, { useEffect, useMemo, useState } from 'react';
import type { Booking, Dispute } from '../../types';
import { DISPUTE_CATEGORY_LABELS } from '../../types';
import type { ApiUser } from '../../services/admin.service';
import { disputeService } from '../../services/dispute.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUser,
  faUserTie,
  faGavel,
  faDollarSign,
  faCamera,
  faExclamationTriangle,
  faCheckCircle,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import styles from './StaffBookingDetailPanel.module.scss';

// ============================================
// PROPS
// ============================================

export interface StaffBookingDetailPanelProps {
  booking: Booking;
  users: ApiUser[];
  onBack: () => void;
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

const statusClass = (status: string): string => {
  switch (status) {
    case 'requested':
      return styles.statusPending;
    case 'accepted':
    case 'consultation_paid':
      return styles.statusAccepted;
    case 'evaluated':
    case 'price_proposed':
    case 'price_agreed':
    case 'in_progress':
      return styles.statusActive;
    case 'completed':
      return styles.statusCompleted;
    case 'declined':
    case 'cancelled':
    case 'price_disputed':
      return styles.statusInactive;
    default:
      return '';
  }
};

// Hide broken images (blob URLs no longer valid in staff browser)
const PhotoTile: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <figure className={styles.photoTile}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </figure>
  );
};

// ============================================
// COMPONENT
// ============================================

export const StaffBookingDetailPanel: React.FC<StaffBookingDetailPanelProps> = ({
  booking,
  users,
  onBack,
}) => {
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const clientUser = userMap.get(booking.clientId);
  const providerUser = userMap.get(booking.providerId);

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [disputeLoading, setDisputeLoading] = useState(true);

  // Fetch any dispute attached to this booking
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setDisputeLoading(true);
        const d = await disputeService.getDisputeByBooking(booking.id);
        if (!cancelled) setDispute(d);
      } catch {
        if (!cancelled) setDispute(null);
      } finally {
        if (!cancelled) setDisputeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [booking.id]);

  const hasConsultation =
    booking.consultationFee > 0 ||
    !!booking.consultationPaidAt ||
    !!booking.consultationClockIn;
  const hasPriceHistory = (booking.priceHistory ?? []).length > 0;
  const hasNegotiationState =
    !!booking.pendingCounterParty || booking.holdFirm;
  const requestPhotos = booking.requestPhotos ?? [];
  const consultPhotos = booking.consultationPhotos ?? [];

  return (
    <div className={styles.panel}>
      {/* Back */}
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to bookings
      </button>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.ref}>{booking.requestRef}</span>
          <span className={`${styles.statusBadge} ${statusClass(booking.status)}`}>
            {booking.status.replace(/_/g, ' ')}
          </span>
        </div>
        <h1 className={styles.title}>{booking.serviceTitle}</h1>
        <p className={styles.subtitle}>
          {booking.serviceCategory} · Requested for {formatDate(booking.requestedDate)}
        </p>
      </header>

      {/* Parties */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Parties</h2>
        <div className={styles.parties}>
          <div className={styles.party}>
            <span className={styles.partyIcon}>
              <FontAwesomeIcon icon={faUser} />
            </span>
            <div>
              <span className={styles.partyRole}>Client</span>
              <strong>{booking.clientDisplayName}</strong>
              {clientUser && (
                <span className={styles.partyMeta}>{clientUser.email}</span>
              )}
            </div>
          </div>
          <div className={styles.party}>
            <span className={styles.partyIcon}>
              <FontAwesomeIcon icon={faUserTie} />
            </span>
            <div>
              <span className={styles.partyRole}>Provider</span>
              <strong>{booking.providerDisplayName}</strong>
              {providerUser && (
                <span className={styles.partyMeta}>
                  {providerUser.email}
                  {providerUser.companyName && ` · ${providerUser.companyName}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Request */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faClipboardList} /> Request
        </h2>
        <p className={styles.description}>{booking.description}</p>

        {requestPhotos.length > 0 && (
          <>
            <span className={styles.subLabel}>
              <FontAwesomeIcon icon={faCamera} /> Client photos
            </span>
            <div className={styles.photoGrid}>
              {requestPhotos.map((url, i) => (
                <PhotoTile key={i} src={url} alt={`Request photo ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Pricing */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faDollarSign} /> Pricing
        </h2>
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <span className={styles.gridLabel}>Suggested</span>
            <span className={styles.gridValue}>
              {formatPrice(booking.suggestedPrice)}
            </span>
          </div>
          {booking.consultationFee > 0 && (
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Consultation fee</span>
              <span className={styles.gridValue}>
                {formatPrice(booking.consultationFee)}
                {booking.consultationPaidAt ? ' · paid' : ' · not paid'}
              </span>
            </div>
          )}
          {booking.finalPrice !== undefined && booking.finalPrice !== null && (
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Final price</span>
              <span className={styles.gridValue}>
                {formatPrice(booking.finalPrice)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Consultation */}
      {hasConsultation && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Consultation</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Paid at</span>
              <span className={styles.gridValue}>
                {formatDateTime(booking.consultationPaidAt)}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Clock in</span>
              <span className={styles.gridValue}>
                {formatDateTime(booking.consultationClockIn)}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Clock out</span>
              <span className={styles.gridValue}>
                {formatDateTime(booking.consultationClockOut)}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Site visited</span>
              <span className={styles.gridValue}>
                {booking.siteVisited ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {booking.consultationNotes && (
            <>
              <span className={styles.subLabel}>Consultation notes</span>
              <div className={styles.notesBox}>{booking.consultationNotes}</div>
            </>
          )}

          {consultPhotos.length > 0 && (
            <>
              <span className={styles.subLabel}>
                <FontAwesomeIcon icon={faCamera} /> Site photos
              </span>
              <div className={styles.photoGrid}>
                {consultPhotos.map((url, i) => (
                  <PhotoTile
                    key={i}
                    src={url}
                    alt={`Site photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Price history */}
      {hasPriceHistory && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Price history</h2>
          <ol className={styles.historyList}>
            {[...booking.priceHistory]
              .sort(
                (a, b) =>
                  new Date(a.at).getTime() - new Date(b.at).getTime()
              )
              .map((h, i) => {
                const isClient = h.byUserId === booking.clientId;
                const isProvider = h.byUserId === booking.providerId;
                const actor = isClient
                  ? 'Client'
                  : isProvider
                  ? 'Provider'
                  : 'Unknown';
                return (
                  <li key={i} className={styles.historyItem}>
                    <div className={styles.historyHead}>
                      <span className={styles.historyStage}>
                        {h.stage.replace(/_/g, ' ')}
                      </span>
                      <span className={styles.historyAmount}>
                        {formatPrice(h.amount)}
                      </span>
                      <span className={styles.historyActor}>{actor}</span>
                      <span className={styles.historyTime}>
                        {formatDateTime(h.at)}
                      </span>
                    </div>
                    {h.note && (
                      <p className={styles.historyNote}>{h.note}</p>
                    )}
                  </li>
                );
              })}
          </ol>
        </section>
      )}

      {/* Negotiation state */}
      {hasNegotiationState && (
        <section className={`${styles.section} ${styles.negotiationSection}`}>
          <h2 className={styles.sectionTitle}>Negotiation in progress</h2>
          <div className={styles.grid}>
            {booking.pendingCounterParty && (
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Waiting on</span>
                <span className={styles.gridValue}>
                  {booking.pendingCounterParty}
                </span>
              </div>
            )}
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Hold firm</span>
              <span className={styles.gridValue}>
                {booking.holdFirm ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Client counters</span>
              <span className={styles.gridValue}>
                {booking.clientCounterCount ?? 0} / 3
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Provider counters</span>
              <span className={styles.gridValue}>
                {booking.providerCounterCount ?? 0} / 3
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Complaint */}
      {booking.hasComplaint && (
        <section className={`${styles.section} ${styles.complaintSection}`}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faExclamationTriangle} /> Client complaint
          </h2>
          <p className={styles.complaintText}>{booking.complaintText}</p>
        </section>
      )}

      {/* Dispute */}
      {!disputeLoading && dispute && (
        <section className={`${styles.section} ${styles.disputeSection}`}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faGavel} /> Dispute
          </h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Category</span>
              <span className={styles.gridValue}>
                {DISPUTE_CATEGORY_LABELS[dispute.category]}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Status</span>
              <span className={styles.gridValue}>
                {dispute.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Raised by</span>
              <span className={styles.gridValue}>
                {dispute.raisedByDisplayName} ({dispute.raisedByRole})
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Against</span>
              <span className={styles.gridValue}>
                {dispute.againstDisplayName} ({dispute.againstRole})
              </span>
            </div>
          </div>
          <p className={styles.disputeReason}>{dispute.reason}</p>
          {dispute.resolutionNote && (
            <div className={styles.resolutionBox}>
              <strong>Resolution:</strong> {dispute.resolutionNote}
            </div>
          )}
          <p className={styles.disputeHint}>
            Open the Disputes tab to review the full thread and respond.
          </p>
        </section>
      )}

      {/* Closure */}
      {booking.status === 'completed' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faCheckCircle} /> Completion
          </h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Client confirmed</span>
              <span className={styles.gridValue}>
                {booking.clientConfirmedComplete ? 'Yes' : 'Not yet'}
              </span>
            </div>
          </div>
        </section>
      )}

      {booking.status === 'declined' && booking.declineReason && (
        <section className={`${styles.section} ${styles.complaintSection}`}>
            <h2 className={styles.sectionTitle}>Decline reason</h2>
            <p className={styles.complaintText}>{booking.declineReason}</p>
        </section>
        )}
    </div>
  );
};

export default StaffBookingDetailPanel;