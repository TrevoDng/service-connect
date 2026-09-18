// src/pages/WorkSessionGate.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { getBookingById } from '../utils/allBookings';
import { setBookingOverride } from '../utils/localBookingOverrides';
import {
  getLocalWorkSessionByBooking,
  addLocalWorkSession,
  updateLocalWorkSession,
} from '../utils/localWorkSessions';
import {
  generateClockInCode,
  clockInCodeExpiry,
  generateId,
} from '../utils/referenceCode';
import { formatTime } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlay,
  faKey,
  faClock,
  faCheckCircle,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { CountdownTimer } from '../components/WorkSession';
import styles from './WorkSessionGate.module.scss';

// ============================================
// COMPONENT
// ============================================

export const WorkSessionGate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [tick, setTick] = useState(0);

  const booking = useMemo(
    () => (id ? getBookingById(id) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, tick]
  );

  const session = useMemo(
    () =>
      booking ? getLocalWorkSessionByBooking(booking.id) : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [booking, tick]
  );

  // ------------------------------------------
  // Guards
  // ------------------------------------------
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'PROVIDER') {
      navigate('/');
      return;
    }
    if (!booking) {
      navigate('/provider/dashboard');
      return;
    }
    if (booking.status !== 'price_agreed' && booking.status !== 'in_progress') {
      navigate('/provider/dashboard');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, user]);

  // ------------------------------------------
  // Actions
  // ------------------------------------------
  const handleArriveAndGenerateCode = () => {
    if (!booking) return;

    const code = generateClockInCode();
    const expiry = clockInCodeExpiry();
    const now = new Date().toISOString();

    // Create a fresh work session
    const newSession = {
      id: generateId(),
      bookingId: booking.id,
      providerId: booking.providerId,
      clientId: booking.clientId,
      currentReferenceCode: code,
      referenceCodeExpiresAt: expiry,
      clockEvents: [],
      daysWorked: 0,
      totalHours: 0,
      beforePhotos: [],
      progressStages: [],
      finalPhotos: [],
      status: 'arrived' as const,
      arrivedAt: now,
      gateConfirmedByClient: false,
      createdAt: now,
      updatedAt: now,
    };

    addLocalWorkSession(newSession);

    // Link the booking to the new session
    setBookingOverride(booking.id, {
      workSessionId: newSession.id,
      updatedAt: now,
    });

    setTick((t) => t + 1);
  };

  const handleBack = () => navigate('/provider/dashboard');

  const handleOpenSession = () => {
    // For now, this navigates to the same gate page but shows the confirmed
    // state. Once 13.4 is built, this will go to the actual WorkSessionPanel.
    navigate(`/provider/bookings/${booking?.id}/start-work`);
  };

  // ------------------------------------------
  // Guard render
  // ------------------------------------------
  if (!booking) return null;

  // ------------------------------------------
  // Already confirmed — show the "cleared" state
  // ------------------------------------------
  const isConfirmed = session?.gateConfirmedByClient === true;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to requests
        </button>

        <header className={styles.header}>
          <span className={styles.ref}>{booking.requestRef}</span>
          <h1 className={styles.title}>Work session — arrival</h1>
          <p className={styles.subtitle}>
            {booking.serviceTitle} · {booking.clientDisplayName}
          </p>
        </header>

        {/* State 1 — No session yet */}
        {!session && (
          <section className={styles.card}>
            <div className={styles.iconCircle}>
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <h2 className={styles.cardTitle}>Confirm you're on site</h2>
            <p className={styles.cardText}>
              Click below when you've arrived. We'll generate a security code
              to share with the client at the gate. You'll be able to clock in
              once they confirm it.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleArriveAndGenerateCode}
            >
              <FontAwesomeIcon icon={faPlay} />
              I've arrived — generate code
            </button>
          </section>
        )}

        {/* State 2 — Code generated, not yet confirmed */}
        {session && !isConfirmed && session.currentReferenceCode && (
          <section className={styles.card}>
            <div className={styles.iconCircle}>
              <FontAwesomeIcon icon={faKey} />
            </div>
            <h2 className={styles.cardTitle}>Share this code at the gate</h2>
            <p className={styles.cardText}>
              Show this code to {booking.clientDisplayName}. They'll confirm it
              in their dashboard. Once confirmed, you'll be able to clock in.
            </p>

            <div className={styles.codeBox}>
              <span className={styles.codeLabel}>Reference code</span>
              <span className={styles.codeValue}>
                {session.currentReferenceCode}
              </span>
              <div className={styles.codeExpiry}>
                <span>Expires in</span>
                <CountdownTimer expiresAt={session.referenceCodeExpiresAt} />
              </div>
            </div>

            <div className={styles.waitingBox}>
              <span className={styles.pulseDot} />
              <div>
                <strong>Waiting for client confirmation</strong>
                <span>Refresh to check — or the page will update automatically.</span>
              </div>
            </div>
          </section>
        )}

        {/* State 3 — Confirmed */}
        {session && isConfirmed && (
          <section className={styles.card}>
            <div className={`${styles.iconCircle} ${styles.iconSuccess}`}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2 className={styles.cardTitle}>You're cleared to work</h2>
            <p className={styles.cardText}>
              {booking.clientDisplayName} confirmed your arrival
              {session.gateConfirmedAt && (
                <> at {formatTime(session.gateConfirmedAt)}</>
              )}
              . You can now clock in and start the job.
            </p>

            <div className={styles.confirmedRow}>
              <FontAwesomeIcon icon={faClock} />
              <span>
                Arrived at{' '}
                <strong>
                  {session.arrivedAt ? formatTime(session.arrivedAt) : '—'}
                </strong>
              </span>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleOpenSession}
            >
              <FontAwesomeIcon icon={faPlay} />
              Open work session
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default WorkSessionGate;
