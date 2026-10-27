// src/components/Disputes/DisputeDetailPanel.tsx

import React, { useEffect, useState } from 'react';
import type { Dispute, DisputeResolution, BookingStatus, Booking } from '../../types';
import {
  DISPUTE_CATEGORY_LABELS,
  DISPUTE_RESOLUTION_LABELS,
} from '../../types';
import { useAuth } from '../../account/context/AuthContext';
import { bookingService } from '../../services/booking.service';
import { disputeService } from '../../services/dispute.service';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatRelative,
} from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGavel,
  faPaperPlane,
  faLock,
  faUnlock,
  faCheckCircle,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import styles from './DisputeDetailPanel.module.scss';

const RESOLUTION_BOOKING_STATUSES: { value: BookingStatus; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'in_progress', label: 'Back to work in progress' },
  { value: 'price_agreed', label: 'Back to price agreed' },
];

export interface DisputeDetailPanelProps {
  dispute: Dispute;
  onBack: () => void;
  onChanged: () => void;
  canResolve?: boolean;
}

export const DisputeDetailPanel: React.FC<DisputeDetailPanelProps> = ({
  dispute,
  onBack,
  onChanged,
  canResolve = true,
}) => {
  const { user } = useAuth();

  const currentRole: 'CLIENT' | 'PROVIDER' | 'EMPLOYEE' | 'ADMIN' =
    user?.role === 'ADMIN'
      ? 'ADMIN'
      : user?.role === 'EMPLOYEE'
      ? 'EMPLOYEE'
      : user?.role === 'PROVIDER'
      ? 'PROVIDER'
      : 'CLIENT';

  const [messageText, setMessageText] = useState('');
  const [internalNote, setInternalNote] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [resolution, setResolution] =
    useState<DisputeResolution>('mutual_agreement');
  const [resolutionNote, setResolutionNote] = useState('');
  const [finalBookingStatus, setFinalBookingStatus] =
    useState<BookingStatus>('completed');
  const [booking, setBooking] = useState<Booking | undefined>(undefined);

  const isOpen = dispute.status === 'open' || dispute.status === 'awaiting_info';

  // Fetch booking context from backend (best-effort)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const b =
          user?.role === 'CLIENT'
            ? await bookingService.getClientBookingById(dispute.bookingId)
            : user?.role === 'PROVIDER'
            ? await bookingService.getProviderBookingById(dispute.bookingId)
            : undefined;
        if (!cancelled) setBooking(b ?? undefined);
      } catch {
        if (!cancelled) setBooking(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispute.bookingId, user?.role]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      await disputeService.addMessage(dispute.id, messageText.trim(), internalNote);
      setMessageText('');
      setInternalNote(false);
      onChanged();
    } catch (err) {
      console.warn('[dispute-message] failed', err);
    }
  };

  const handleRequestInfo = async () => {
    try {
      await disputeService.requestInfo(dispute.id);
      onChanged();
    } catch (err) {
      console.warn('[dispute-request-info] failed', err);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) return;
    try {
      await disputeService.resolve(dispute.id, {
        resolution,
        resolutionNote: resolutionNote.trim(),
        finalBookingStatus,
      });
      setShowResolve(false);
      onChanged();
    } catch (err) {
      console.warn('[dispute-resolve] failed', err);
    }
  };

  return (
    <div className={styles.panel}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to disputes
      </button>

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.ref}>{dispute.requestRef}</span>
          <span
            className={`${styles.statusBadge} ${
              isOpen ? styles.statusOpen : styles.statusResolved
            }`}
          >
            {isOpen ? 'Open' : 'Resolved'}
          </span>
          <span className={styles.age}>
            Updated {formatRelative(dispute.updatedAt)}
          </span>
        </div>
        <h1 className={styles.title}>
          {DISPUTE_CATEGORY_LABELS[dispute.category]}
        </h1>
        {booking && (
          <p className={styles.bookingLine}>
            {booking.serviceTitle} · {booking.serviceCategory}
          </p>
        )}
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Parties</h2>
        <div className={styles.parties}>
          <div className={styles.party}>
            <span className={styles.partyIcon}>
              <FontAwesomeIcon icon={faUser} />
            </span>
            <div>
              <span className={styles.partyRole}>Raised by</span>
              <strong>{dispute.raisedByDisplayName}</strong>
              <span className={styles.partyRoleLabel}>{dispute.raisedByRole}</span>
            </div>
          </div>
          <div className={styles.party}>
            <span className={styles.partyIcon}>
              <FontAwesomeIcon icon={faUserTie} />
            </span>
            <div>
              <span className={styles.partyRole}>Against</span>
              <strong>{dispute.againstDisplayName}</strong>
              <span className={styles.partyRoleLabel}>{dispute.againstRole}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reason</h2>
        <div className={styles.reason}>{dispute.reason}</div>

        {dispute.photos && dispute.photos.length > 0 && (
          <div className={styles.photoGrid}>
            {dispute.photos.map((url, i) => (
              <figure key={i} className={styles.photoTile}>
                <img src={url} alt={`Evidence ${i + 1}`} loading="lazy" />
              </figure>
            ))}
          </div>
        )}
      </section>

      {booking && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Booking context</h2>
          <div className={styles.contextGrid}>
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Status</span>
              <span className={styles.contextValue}>{booking.status}</span>
            </div>
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Suggested price</span>
              <span className={styles.contextValue}>
                {formatPrice(booking.suggestedPrice)}
              </span>
            </div>
            {booking.finalPrice !== undefined && (
              <div className={styles.contextItem}>
                <span className={styles.contextLabel}>Final price</span>
                <span className={styles.contextValue}>
                  {formatPrice(booking.finalPrice)}
                </span>
              </div>
            )}
            <div className={styles.contextItem}>
              <span className={styles.contextLabel}>Fee paid</span>
              <span className={styles.contextValue}>
                {booking.consultationPaidAt
                  ? formatDate(booking.consultationPaidAt)
                  : 'Not paid'}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faGavel} /> Conversation
        </h2>

        <div className={styles.thread}>
          {dispute.messages.filter((m) => !m.internal || canResolve).length === 0 ? (
            <p className={styles.threadEmpty}>No messages yet.</p>
          ) : (
            dispute.messages
              .filter((m) => !m.internal || canResolve)
              .map((m) => (
                <div
                  key={m.id}
                  className={`${styles.message} ${
                    m.internal ? styles.messageInternal : ''
                  }`}
                >
                  <div className={styles.messageHeader}>
                    <strong>{m.authorDisplayName}</strong>
                    <span className={styles.messageRole}>{m.authorRole}</span>
                    {m.internal && (
                      <span className={styles.messageInternalTag}>
                        <FontAwesomeIcon icon={faLock} /> Internal
                      </span>
                    )}
                    <span className={styles.messageTime}>
                      {formatDateTime(m.createdAt)}
                    </span>
                  </div>
                  <p className={styles.messageText}>{m.text}</p>
                </div>
              ))
          )}
        </div>

        {isOpen && (
          <div className={styles.composer}>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              placeholder="Write a message to both parties…"
              className={styles.composerTextarea}
            />

            <div className={styles.composerRow}>
              {canResolve && (
                <label className={styles.internalToggle}>
                  <input
                    type="checkbox"
                    checked={internalNote}
                    onChange={(e) => setInternalNote(e.target.checked)}
                  />
                  <FontAwesomeIcon icon={internalNote ? faLock : faUnlock} />
                  <span>Internal note</span>
                </label>
              )}

              <button
                type="button"
                className={styles.sendBtn}
                disabled={!messageText.trim()}
                onClick={handleSendMessage}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                Send
              </button>
            </div>
          </div>
        )}
      </section>

      {isOpen && canResolve && !showResolve && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resolution</h2>
          <div className={styles.resolveActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleRequestInfo}
            >
              Request more info
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setShowResolve(true)}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Resolve dispute
            </button>
          </div>
        </section>
      )}

      {isOpen && canResolve && showResolve && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Resolve dispute</h2>

          <div className={styles.field}>
            <label className={styles.label}>Outcome</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as DisputeResolution)}
              className={styles.select}
            >
              {(Object.keys(DISPUTE_RESOLUTION_LABELS) as DisputeResolution[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {DISPUTE_RESOLUTION_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Final booking status</label>
            <select
              value={finalBookingStatus}
              onChange={(e) => setFinalBookingStatus(e.target.value as BookingStatus)}
              className={styles.select}
            >
              {RESOLUTION_BOOKING_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Resolution note (both parties see)</label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={4}
              placeholder="Explain the outcome and any next steps."
              className={styles.textarea}
            />
          </div>

          <div className={styles.resolveActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowResolve(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!resolutionNote.trim()}
              onClick={handleResolve}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Confirm resolution
            </button>
          </div>
        </section>
      )}

      {!isOpen && dispute.resolution && (
        <section className={`${styles.section} ${styles.resolvedSection}`}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faCheckCircle} /> Resolution
          </h2>
          <p className={styles.resolutionOutcome}>
            {DISPUTE_RESOLUTION_LABELS[dispute.resolution]}
          </p>
          {dispute.resolutionNote && (
            <p className={styles.resolutionNote}>{dispute.resolutionNote}</p>
          )}
          <p className={styles.resolutionMeta}>
            Resolved by {dispute.resolvedByDisplayName}
            {dispute.resolvedAt && ` · ${formatDateTime(dispute.resolvedAt)}`}
          </p>
        </section>
      )}
    </div>
  );
};

export default DisputeDetailPanel;