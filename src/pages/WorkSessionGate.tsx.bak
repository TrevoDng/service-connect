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
  updateGateEvent,
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

import { WorkSessionPanel } from '../components/WorkSession';
import type { ProgressStage, WorkPhoto } from '../types';
//import { generateId } from '../utils/referenceCode';
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
  const [showProceedPrompt, setShowProceedPrompt] = useState(false);
  const [proceedNote, setProceedNote] = useState('');

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

  const handleProceedAnyway = () => {
  if (!session || !booking) return;

  updateGateEvent(session.id, {
    status: 'auto_proceeded',
    attemptedAt: session.gateEvent?.attemptedAt ?? session.arrivedAt ?? new Date().toISOString(),
    resolvedAt: new Date().toISOString(),
    resolvedByUserId: booking.providerId,
    resolvedByDisplayName: booking.providerDisplayName,
    note: proceedNote.trim() || undefined,
  });

  setShowProceedPrompt(false);
  setProceedNote('');
  setTick((t) => t + 1);
};

  // ------------------------------------------
// Work session mutators
// ------------------------------------------
const handleClockIn = (sessionId: string) => {
  if (!session) return;
  updateLocalWorkSession(sessionId, {
    status: 'in_progress',
    currentReferenceCode: undefined,
    referenceCodeExpiresAt: undefined,
    clockEvents: [
      ...session.clockEvents,
      {
        id: generateId(),
        type: 'in',
        at: new Date().toISOString(),
        confirmedByClient: true,
      },
    ],
    updatedAt: new Date().toISOString(),
  });
  setTick((t) => t + 1);
};

const handleClockOut = (sessionId: string) => {
  if (!session) return;
  const outAt = new Date().toISOString();
  const lastIn = [...session.clockEvents]
    .reverse()
    .find((e) => e.type === 'in');

  let addedHours = 0;
  if (lastIn) {
    addedHours =
      (new Date(outAt).getTime() - new Date(lastIn.at).getTime()) /
      3_600_000;
  }

  updateLocalWorkSession(sessionId, {
    clockEvents: [
      ...session.clockEvents,
      {
        id: generateId(),
        type: 'out',
        at: outAt,
        confirmedByClient: false,
      },
    ],
    daysWorked: session.daysWorked + 1,
    totalHours: Number((session.totalHours + addedHours).toFixed(2)),
    updatedAt: outAt,
  });
  setTick((t) => t + 1);
};

const handleMarkComplete = (sessionId: string) => {
  if (!session) return;
  updateLocalWorkSession(sessionId, {
    status: 'completed',
    currentReferenceCode: undefined,
    referenceCodeExpiresAt: undefined,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Move the booking to completed too
  if (booking) {
    setBookingOverride(booking.id, {
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });
  }
  setTick((t) => t + 1);
};

const handleAddBeforePhotos = (sessionId: string, photos: WorkPhoto[]) => {
  updateLocalWorkSession(sessionId, { beforePhotos: photos });
  setTick((t) => t + 1);
};

const handleDeleteBeforePhoto = (sessionId: string, photoId: string) => {
  if (!session) return;
  updateLocalWorkSession(sessionId, {
    beforePhotos: session.beforePhotos.filter((p) => p.id !== photoId),
  });
  setTick((t) => t + 1);
};

const handleSaveProgressStage = (
  sessionId: string,
  stage: ProgressStage
) => {
  if (!session) return;
  const exists = session.progressStages.some((st) => st.id === stage.id);
  const nextStages = exists
    ? session.progressStages.map((st) => (st.id === stage.id ? stage : st))
    : [...session.progressStages, stage];
  updateLocalWorkSession(sessionId, { progressStages: nextStages });
  setTick((t) => t + 1);
};

const handleDeleteProgressStage = (sessionId: string, stageId: string) => {
  if (!session) return;
  updateLocalWorkSession(sessionId, {
    progressStages: session.progressStages.filter((st) => st.id !== stageId),
  });
  setTick((t) => t + 1);
};

const handleAddFinalPhotos = (sessionId: string, photos: WorkPhoto[]) => {
  updateLocalWorkSession(sessionId, { finalPhotos: photos });
  setTick((t) => t + 1);
};

const handleDeleteFinalPhoto = (sessionId: string, photoId: string) => {
  if (!session) return;
  updateLocalWorkSession(sessionId, {
    finalPhotos: session.finalPhotos.filter((p) => p.id !== photoId),
  });
  setTick((t) => t + 1);
};

  // ------------------------------------------
  // Guard render
  // ------------------------------------------
  if (!booking) return null;

  // ------------------------------------------
  // Already confirmed — show the "cleared" state
  // ------------------------------------------
  const isConfirmed =
  session?.gateConfirmedByClient === true ||
  session?.gateEvent?.status === 'auto_proceeded' ||
  session?.gateEvent?.status === 'confirmed_late';

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
        <span>They may be away — you can still proceed if needed.</span>
      </div>
    </div>

    {/* Proceed anyway */}
    {!showProceedPrompt && (
      <button
        type="button"
        className={styles.proceedBtn}
        onClick={() => setShowProceedPrompt(true)}
      >
        Client not available? Proceed anyway
      </button>
    )}

    {showProceedPrompt && (
      <div className={styles.proceedPanel}>
        <div className={styles.proceedWarning}>
  <FontAwesomeIcon icon={faShieldAlt} />
  <div>
    <strong>Proceeding without confirmation</strong>
    <span>
      This step will be recorded. If something goes wrong and ServiceConnect
      can't verify it happened in the app, we may not be able to mediate the
      job or cover it under platform protections.
    </span>
  </div>
</div>

        <textarea
          value={proceedNote}
          onChange={(e) => setProceedNote(e.target.value)}
          rows={2}
          placeholder="Optional note — e.g. 'Security let me in'"
          className={styles.proceedNote}
        />

        <div className={styles.proceedActions}>
          <button
            type="button"
            className={styles.proceedCancel}
            onClick={() => {
              setShowProceedPrompt(false);
              setProceedNote('');
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.proceedConfirm}
            onClick={handleProceedAnyway}
          >
            Proceed anyway
          </button>
        </div>
      </div>
    )}
  </section>
)}

	{/* State 3 — Confirmed → show the full work session panel */}
{session && isConfirmed && (
  <WorkSessionPanel
    session={session}
    booking={booking}
    providerId={booking.providerId}
    onClockIn={handleClockIn}
    onClockOut={handleClockOut}
    onMarkComplete={handleMarkComplete}
    workReady
    onAddBeforePhotos={handleAddBeforePhotos}
    onDeleteBeforePhoto={handleDeleteBeforePhoto}
    onSaveProgressStage={handleSaveProgressStage}
    onDeleteProgressStage={handleDeleteProgressStage}
    onAddFinalPhotos={handleAddFinalPhotos}
    onDeleteFinalPhoto={handleDeleteFinalPhoto}
  />
)}
      </div>
    </div>
  );
};

export default WorkSessionGate;
