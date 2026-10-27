// src/components/Disputes/RaiseDisputePicker.tsx

import React, { useEffect, useMemo, useState } from 'react';
import type {
  Booking,
  Dispute,
  RaiseDisputeFormData,
} from '../../types';
import { useAuth } from '../../account/context/AuthContext';
import { isEligibleForDispute } from '../../utils/allBookings';
import { bookingService } from '../../services/booking.service';
import { disputeService } from '../../services/dispute.service';
import { formatDate } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faArrowLeft,
  faChevronRight,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import { RaiseDisputePanel } from '../Requests/RaiseDisputePanel';
import styles from './RaiseDisputePicker.module.scss';

export interface RaiseDisputePickerProps {
  viewerRole: 'CLIENT' | 'PROVIDER';
  onCancel: () => void;
  onCreated: (dispute: Dispute) => void;
}

export const RaiseDisputePicker: React.FC<RaiseDisputePickerProps> = ({
  viewerRole,
  onCancel,
  onCreated,
}) => {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [existingDisputes, setExistingDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const myBookings =
          viewerRole === 'CLIENT'
            ? await bookingService.getMyBookings(user.id)
            : await bookingService.getProviderBookings(user.id);
        const myDisputes = await disputeService.getMyDisputes();
        if (!cancelled) {
          setBookings(myBookings);
          setExistingDisputes(myDisputes);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[raise-picker] fetch failed', err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, viewerRole]);

  const eligibleBookings = useMemo(() => {
    const disputedIds = new Set(existingDisputes.map((d) => d.bookingId));
    return bookings.filter(
      (b) => isEligibleForDispute(b) && !disputedIds.has(b.id)
    );
  }, [bookings, existingDisputes]);

  const handleSubmit = async (form: RaiseDisputeFormData) => {
    if (!selectedBooking) return;
    try {
      const dispute = await disputeService.raiseDispute(selectedBooking.id, form);
      onCreated(dispute);
    } catch (err) {
      console.warn('[raise-dispute] failed', err);
    }
  };

  // ------------------------------------------
  // Raise form
  // ------------------------------------------
  if (selectedBooking) {
    const counterpartyName =
      viewerRole === 'CLIENT'
        ? selectedBooking.providerDisplayName
        : selectedBooking.clientDisplayName;

    return (
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => setSelectedBooking(null)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Pick a different booking
        </button>

        <RaiseDisputePanel
          againstName={counterpartyName}
          serviceTitle={selectedBooking.serviceTitle}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // ------------------------------------------
  // Picker
  // ------------------------------------------
    if (loading) {
      return (
        <div
          className={styles.wrapper}
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-primary, #111)',
          }}
        >
          Loading…
        </div>
      );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <FontAwesomeIcon icon={faGavel} className={styles.headerIcon} />
        <div>
          <h3 className={styles.title}>Which booking is this about?</h3>
          <p className={styles.subtitle}>
            Only bookings that are active or complete can be disputed. Jobs
            you've already disputed won't show here.
          </p>
        </div>
      </header>

      {eligibleBookings.length === 0 ? (
        <div className={styles.empty}>
          <FontAwesomeIcon icon={faInbox} className={styles.emptyIcon} />
          <h4>No eligible bookings</h4>
          <p>
            {viewerRole === 'CLIENT'
              ? "You'll be able to raise a dispute here once a provider accepts one of your requests."
              : "You'll be able to raise a dispute here once a client has accepted a job with you."}
          </p>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Close
          </button>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {eligibleBookings.map((b) => {
              const counterpartyName =
                viewerRole === 'CLIENT'
                  ? b.providerDisplayName
                  : b.clientDisplayName;
              return (
                <button
                  key={b.id}
                  type="button"
                  className={styles.row}
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className={styles.rowBody}>
                    <div className={styles.rowTop}>
                      <span className={styles.rowRef}>{b.requestRef}</span>
                      <span className={styles.rowStatus}>{b.status}</span>
                    </div>
                    <h4 className={styles.rowTitle}>{b.serviceTitle}</h4>
                    <p className={styles.rowMeta}>
                      {viewerRole === 'CLIENT' ? 'Provider' : 'Client'}:{' '}
                      <strong>{counterpartyName}</strong>
                      {' · '}
                      {formatDate(b.requestedDate)}
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={styles.rowChevron}
                  />
                </button>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RaiseDisputePicker;