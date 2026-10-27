// src/pages/WorkSessionGate.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { useNotifications } from '../account/context/NotificationContext';
import { useTheme } from '../styles/context/ThemeContext';
import {
  generateClockInCode,
  clockInCodeExpiry,
} from '../utils/referenceCode';
import {
  notifyConsultationStarted,
} from '../utils/notify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlay,
  faKey,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { CountdownTimer } from '../components/WorkSession';

import { WorkSessionPanel } from '../components/WorkSession';
import type { Booking, ProgressStage, WorkPhoto, WorkSession } from '../types';
//import { generateId } from '../utils/referenceCode';
import styles from './WorkSessionGate.module.scss';
import { bookingService } from '../services/booking.service';

// ============================================
// COMPONENT
// ============================================

export const WorkSessionGate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useNotifications();
  const { theme } = useTheme();

  const [tick, setTick] = useState(0);
  const [showProceedPrompt, setShowProceedPrompt] = useState(false);
  const [proceedNote, setProceedNote] = useState('');

  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [session, setSession] = useState<WorkSession | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

useEffect(() => {
  let cancelled = false;
  (async () => {
    if (!id) { setLoading(false); return; }
    // Only show the loading spinner on the very first fetch.
    // Polling refreshes must NOT unmount the panel or the user's
    // in-progress upload / form state is lost.
    if (!hasLoadedRef.current) setLoading(true);
    const b = await bookingService.getProviderBookingById(id);
    if (cancelled) return;
    setBooking(b);
    if (b) {
      const s = await bookingService.getProviderWorkSession(b.id);
      if (!cancelled) setSession(s ?? undefined);
    }
    if (!cancelled) {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  })();
  return () => { cancelled = true; };
}, [id, tick]);

// Auto-refresh every 10s while the tab is visible
useEffect(() => {
  const id = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      setTick((t) => t + 1);
    }
  }, 10_000);
  return () => window.clearInterval(id);
}, []);

// Refresh immediately when the tab regains focus
useEffect(() => {
  const onFocus = () => {
    if (document.visibilityState === 'visible') {
      setTick((t) => t + 1);
    }
  };
  document.addEventListener('visibilitychange', onFocus);
  window.addEventListener('focus', onFocus);
  return () => {
    document.removeEventListener('visibilitychange', onFocus);
    window.removeEventListener('focus', onFocus);
  };
}, []);

  // ------------------------------------------
  // Guards
  // ------------------------------------------
  useEffect(() => {
  if (loading) return;                    // ← wait for fetch
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
}, [booking, user, loading]);             // ← add loading
  // ------------------------------------------
  // Actions
  // ------------------------------------------
  const handleArriveAndGenerateCode = async () => {
  if (!booking) return;
  const code = generateClockInCode();
  const expiry = clockInCodeExpiry();
  try {
    const newSession = await bookingService.arriveAtSite(booking.id, code, expiry);
    setSession(newSession);
    add(notifyConsultationStarted(booking, code, newSession.id));
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[arrive] failed', err);
  }
};

  const handleBack = () => navigate('/provider/dashboard');

  const handleProceedAnyway = async () => {
  if (!booking) return;
  try {
    const s = await bookingService.proceedAnyway(booking.id, proceedNote.trim());
    setSession(s);
    setShowProceedPrompt(false);
    setProceedNote('');
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[proceed-anyway] failed', err);
  }
};

  // ------------------------------------------
// Work session mutators
// ------------------------------------------
const handleClockIn = async (_sessionId: string) => {
  if (!booking) return;
  try {
    const s = await bookingService.clockIn(booking.id);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[clock-in] failed', err);
  }
};

const handleClockOut = async (_sessionId: string) => {
  if (!booking) return;
  try {
    const s = await bookingService.clockOut(booking.id);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[clock-out] failed', err);
  }
};

const handleMarkComplete = async (_sessionId: string) => {
  if (!booking) return;
  try {
    const s = await bookingService.completeSession(booking.id);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[complete] failed', err);
  }
};

const handleAddBeforePhotos = async (_sessionId: string, photos: WorkPhoto[]) => {
  if (!booking) return;
  try {
    const s = await bookingService.setBeforePhotos(booking.id, photos);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[before-photos] failed', err);
  }
};

const handleDeleteBeforePhoto = async (_sessionId: string, photoId: string) => {
  if (!booking) return;
  try {
    const s = await bookingService.deleteBeforePhoto(booking.id, photoId);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[delete-before-photo] failed', err);
  }
};

const handleSaveProgressStage = async (_sessionId: string, stage: ProgressStage) => {
  if (!booking) return;
  try {
    const s = await bookingService.upsertProgressStage(booking.id, stage);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[upsert-stage] failed', err);
  }
};

const handleDeleteProgressStage = async (_sessionId: string, stageId: string) => {
  if (!booking) return;
  try {
    const s = await bookingService.deleteProgressStage(booking.id, stageId);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[delete-stage] failed', err);
  }
};

const handleAddFinalPhotos = async (_sessionId: string, photos: WorkPhoto[]) => {
  if (!booking) return;
  try {
    const s = await bookingService.setFinalPhotos(booking.id, photos);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[final-photos] failed', err);
  }
};

const handleDeleteFinalPhoto = async (_sessionId: string, photoId: string) => {
  if (!booking) return;
  try {
    const s = await bookingService.deleteFinalPhoto(booking.id, photoId);
    setSession(s);
    setTick((t) => t + 1);
  } catch (err) {
    console.error('[delete-final-photo] failed', err);
  }
};

  // ------------------------------------------
  // Guard render
  // ------------------------------------------
  if (loading) {
  return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
}

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

{/* State 2.5 — Access denied, no code — allow retry or proceed anyway */}
{session && !isConfirmed && !session.currentReferenceCode && (
  <section className={styles.card}>
    <div className={styles.iconCircle}>
      <FontAwesomeIcon icon={faShieldAlt} />
    </div>
    <h2 className={styles.cardTitle}>Access was denied</h2>
    <p className={styles.cardText}>
      The client didn't confirm your code, or it expired. Request a new code,
      or proceed anyway if you're sure it's OK.
    </p>

    <button
      type="button"
      className={styles.primaryBtn}
      onClick={handleArriveAndGenerateCode}
    >
      <FontAwesomeIcon icon={faKey} />
      Request a new code
    </button>

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
    mode="work"
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
