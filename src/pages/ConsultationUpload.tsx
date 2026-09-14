// src/pages/ConsultationUpload.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { getBookingById } from '../utils/allBookings';
import { setBookingOverride } from '../utils/localBookingOverrides';
import {
  generateClockInCode,
  clockInCodeExpiry,
  generateId,
} from '../utils/referenceCode';
import { formatDate, formatTime } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlay,
  faStop,
  faKey,
  faCamera,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { PhotoUploadButton } from '../components/WorkSession';
import { CountdownTimer } from '../components/WorkSession';
import styles from './ConsultationUpload.module.scss';

const MAX_PHOTOS = 5;
const DEMO_PROVIDER_ID = 'p-001';

// ============================================
// COMPONENT
// ============================================

export const ConsultationUpload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read booking fresh — we re-read after clock actions so the UI is current
  const [tick, setTick] = useState(0);
  const booking = useMemo(
    () => (id ? getBookingById(id) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, tick]
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
    // Booking must be at consultation_paid to be uploaded
    if (booking.status !== 'consultation_paid') {
      navigate('/provider/dashboard');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, user]);

  // ------------------------------------------
  // Derived state
  // ------------------------------------------
  const clockedIn =
    !!booking?.consultationClockIn && !booking?.consultationClockOut;
  const clockedOut =
    !!booking?.consultationClockIn && !!booking?.consultationClockOut;
  const hasActiveCode =
    !!booking?.consultationReferenceCode && clockedIn;

  const canSubmit =
    clockedOut && photos.length > 0 && notes.trim().length > 0 && !isSubmitting;

  // ------------------------------------------
  // Actions
  // ------------------------------------------
  const handleClockIn = () => {
    if (!booking) return;
    const code = generateClockInCode();
    setBookingOverride(booking.id, {
      consultationClockIn: new Date().toISOString(),
      consultationClockOut: undefined,
      consultationReferenceCode: code,
      consultationReferenceExpiresAt: clockInCodeExpiry(),
      updatedAt: new Date().toISOString(),
    });
    setTick((t) => t + 1);
  };

  const handleClockOut = () => {
    if (!booking) return;
    setBookingOverride(booking.id, {
      consultationClockOut: new Date().toISOString(),
      consultationReferenceCode: undefined,
      consultationReferenceExpiresAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    setTick((t) => t + 1);
  };

  const handlePhotoUpload = (urls: string[]) => {
    const remaining = MAX_PHOTOS - photos.length;
    setPhotos((prev) => [...prev, ...urls.slice(0, remaining)]);
  };

  const handlePhotoDelete = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !canSubmit) return;

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setBookingOverride(booking.id, {
        status: 'evaluated',
        siteVisited: true,
        consultationPhotos: photos,
        consultationNotes: notes.trim(),
        updatedAt: new Date().toISOString(),
      });
      navigate('/provider/dashboard');
    }, 600);
  };

  const handleCancel = () => {
    navigate('/provider/dashboard');
  };

  // ------------------------------------------
  // Guards — nothing until booking is ready
  // ------------------------------------------
  if (!booking || booking.status !== 'consultation_paid') {
    return null;
  }

  const remaining = MAX_PHOTOS - photos.length;

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        {/* Back */}
        <button type="button" className={styles.backBtn} onClick={handleCancel}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Requests
        </button>

        {/* Header */}
        <header className={styles.header}>
          <span className={styles.ref}>{booking.requestRef}</span>
          <h1 className={styles.title}>Site consultation</h1>
          <p className={styles.subtitle}>
            Visit the site, capture photos, and record your findings for{' '}
            <strong>{booking.clientDisplayName}</strong>.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* -------- CLOCK IN / OUT -------- */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faKey} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Visit tracking</h2>
            </header>

            {!clockedIn && !clockedOut && (
              <div className={styles.clockPrompt}>
                <p>Ready to begin? Clock in when you arrive on site.</p>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleClockIn}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Clock In
                </button>
              </div>
            )}

            {clockedIn && (
              <>
                {hasActiveCode && (
                  <div className={styles.codeBlock}>
                    <div className={styles.codeLeft}>
                      <FontAwesomeIcon icon={faKey} className={styles.codeIcon} />
                      <div>
                        <div className={styles.codeLabel}>Reference code</div>
                        <div className={styles.codeValue}>
                          {booking.consultationReferenceCode}
                        </div>
                      </div>
                    </div>
                    <div className={styles.codeRight}>
                      <span className={styles.codeExpiryLabel}>Expires in</span>
                      <CountdownTimer
                        expiresAt={booking.consultationReferenceExpiresAt}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.clockInfo}>
                  <span>
                    Clocked in at{' '}
                    <strong>{formatTime(booking.consultationClockIn)}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleClockOut}
                >
                  <FontAwesomeIcon icon={faStop} />
                  Clock Out
                </button>
              </>
            )}

            {clockedOut && (
              <div className={styles.clockDone}>
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>
                  Visit completed — clocked in at{' '}
                  <strong>{formatTime(booking.consultationClockIn)}</strong>,
                  clocked out at{' '}
                  <strong>{formatTime(booking.consultationClockOut)}</strong>
                </span>
              </div>
            )}
          </section>

          {/* -------- PHOTOS -------- */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faCamera} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Site photos</h2>
              <span className={styles.photoCount}>
                {photos.length} / {MAX_PHOTOS}
              </span>
            </header>

            <p className={styles.sectionHint}>
              Upload 1–5 photos of the work environment so the client can see
              what you're evaluating.
            </p>

            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((url, i) => (
                  <figure key={i} className={styles.photoTile}>
                    <img src={url} alt={`Site photo ${i + 1}`} />
                    <button
                      type="button"
                      className={styles.photoDelete}
                      onClick={() => handlePhotoDelete(i)}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </figure>
                ))}
              </div>
            )}

            {remaining > 0 && (
              <div className={styles.uploadRow}>
                <PhotoUploadButton
                  onUploaded={handlePhotoUpload}
                  maxFiles={remaining}
                  label={photos.length === 0 ? 'Add photos' : 'Add more'}
                />
              </div>
            )}
          </section>

          {/* -------- NOTES -------- */}
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <FontAwesomeIcon
                icon={faClipboardList}
                className={styles.sectionIcon}
              />
              <h2 className={styles.sectionTitle}>Findings</h2>
            </header>

            <p className={styles.sectionHint}>
              Describe what you found on site. The client and any future
              provider will see this.
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className={styles.textarea}
              placeholder="E.g. Existing tiles are set on a thick mortar bed. Removal will take 2 extra days. Plumbing needs upgrading for the new shower."
            />
          </section>

          {/* -------- ERROR -------- */}
          {error && <div className={styles.error}>{error}</div>}

          {/* -------- SUBMIT -------- */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={!canSubmit}
              title={
                !clockedOut
                  ? 'Clock out first'
                  : photos.length === 0
                  ? 'Upload at least one photo'
                  : !notes.trim()
                  ? 'Add your findings'
                  : undefined
              }
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Submitting…
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Submit consultation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationUpload;
