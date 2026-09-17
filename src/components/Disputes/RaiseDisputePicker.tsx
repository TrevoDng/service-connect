// src/components/Disputes/RaiseDisputePicker.tsx

import React, { useMemo, useState } from 'react';
import type {
  Booking,
  Dispute,
  RaiseDisputeFormData,
  ViewerRole,
} from '../../types';
import {
  getBookingsForClient,
  getBookingsForProvider,
  isEligibleForDispute,
} from '../../utils/allBookings';
import { getDisputeByBooking } from '../../utils/allDisputes';
import { addLocalDispute, addDisputeMessage } from '../../utils/localDisputes';
import { generateId } from '../../utils/referenceCode';
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

// ============================================
// DEMO USER MAP
// ============================================

const DEMO_USER_IDS: Record<'CLIENT' | 'PROVIDER', string> = {
  CLIENT: 'c-001',
  PROVIDER: 'p-001',
};

// ============================================
// PROPS
// ============================================

export interface RaiseDisputePickerProps {
  /** Only CLIENT or PROVIDER should render this picker */
  viewerRole: 'CLIENT' | 'PROVIDER';
  /** Fired when the user cancels the whole flow */
  onCancel: () => void;
  /** Fired after a dispute has been successfully created */
  onCreated: (dispute: Dispute) => void;
}

// ============================================
// COMPONENT
// ============================================

export const RaiseDisputePicker: React.FC<RaiseDisputePickerProps> = ({
  viewerRole,
  onCancel,
  onCreated,
}) => {
  const viewerUserId = DEMO_USER_IDS[viewerRole];

  // Which booking has been selected for raising a dispute (null = picker view)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ------------------------------------------
  // Eligible bookings
  // ------------------------------------------
  const eligibleBookings = useMemo(() => {
    const source =
      viewerRole === 'CLIENT'
        ? getBookingsForClient(viewerUserId)
        : getBookingsForProvider(viewerUserId);

    return source.filter(
      (b) => isEligibleForDispute(b) && !getDisputeByBooking(b.id)
    );
  }, [viewerRole, viewerUserId]);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const handleSubmit = (form: RaiseDisputeFormData) => {
    if (!selectedBooking) return;

    const now = new Date().toISOString();
    const isClient = viewerRole === 'CLIENT';
    const b = selectedBooking;

    const raisedByUserId = isClient ? b.clientId : b.providerId;
    const raisedByDisplayName = isClient
      ? b.clientDisplayName
      : b.providerDisplayName;
    const againstUserId = isClient ? b.providerId : b.clientId;
    const againstDisplayName = isClient
      ? b.providerDisplayName
      : b.clientDisplayName;

    const dispute: Dispute = {
      id: generateId(),
      bookingId: b.id,
      requestRef: b.requestRef,
      raisedByUserId,
      raisedByRole: viewerRole,
      raisedByDisplayName,
      againstUserId,
      againstRole: isClient ? 'PROVIDER' : 'CLIENT',
      againstDisplayName,
      category: form.category,
      reason: form.reason,
      photos: form.photos,
      status: 'open',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    addLocalDispute(dispute);

    // Seed system message
    addDisputeMessage(dispute.id, {
      authorId: 'system',
      authorDisplayName: 'ServiceConnect',
      authorRole: 'SYSTEM',
      text: `Dispute raised by ${raisedByDisplayName}. A support agent will review this and respond shortly.`,
      internal: false,
    });

    onCreated(dispute);
  };

  // ------------------------------------------
  // Raise form view (booking selected)
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
  // Picker view
  // ------------------------------------------
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
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
          >
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
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RaiseDisputePicker;
