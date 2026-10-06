// src/pages/ConsultationPayment.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { getBookingById } from '../utils/allBookings';
import { setBookingOverride } from '../utils/localBookingOverrides';
import { formatDate, formatPrice } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faShieldAlt,
  faCheckCircle,
  faInfoCircle,
  faFileInvoiceDollar,
  faMapMarkedAlt,
  faCamera,
  faListCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ConsultationPayment.module.scss';

// ============================================
// BENEFITS — the four points clients should understand
// ============================================

const BENEFITS = [
  {
    icon: faFileInvoiceDollar,
    title: 'Paid only once',
    body: 'This is a single fee for the whole job. No recurring charges.',
  },
  {
    icon: faCamera,
    title: 'Provider uploads site photos',
    body: 'Even if you later decide not to proceed, the provider must upload photos and findings from the site visit.',
  },
  {
    icon: faListCheck,
    title: 'Findings carry forward',
    body: 'If you choose a different provider next, the photos and notes from the first visit are shared with them — no repeated trips.',
  },
  {
    icon: faShieldAlt,
    title: 'Protects you from wasted time',
    body: 'Prevents repeatedly paying multiple providers to evaluate the same impossible or lowball offer.',
  },
];

// ============================================
// COMPONENT
// ============================================

export const ConsultationPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [isPaying, setIsPaying] = useState(false);

  // Read booking fresh from the merged store
  const booking = useMemo(() => (id ? getBookingById(id) : undefined), [id]);

  // ------------------------------------------
  // Guards
  // ------------------------------------------
  useEffect(() => {
    // Not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Not a client
    if (user.role !== 'CLIENT') {
      navigate('/');
      return;
    }

    // Booking not found
    if (!booking) {
      navigate('/client/dashboard');
      return;
    }

    // Already paid — nothing to do here
    if (booking.consultationPaidAt) {
      navigate('/client/dashboard');
      return;
    }

    // Only allow this page when the provider has accepted the request
    if (booking.status !== 'accepted') {
      navigate('/client/dashboard');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, user]);

  // ------------------------------------------
  // Action
  // ------------------------------------------
  const handlePay = () => {
    if (!booking) return;

    setIsPaying(true);

    // Mock payment — no real gateway. This is where Stripe/Payfast will go.
    setTimeout(() => {
      setBookingOverride(booking.id, {
        status: 'consultation_paid',
        consultationPaidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priceHistory: [
          ...booking.priceHistory,
          {
            stage: 'consultation',
            amount: booking.consultationFee,
            at: new Date().toISOString(),
            byUserId: user?.id || booking.clientId,
            note: 'Consultation fee paid.',
          },
        ],
      });

      navigate('/client/dashboard');
    }, 800);
  };

  const handleCancel = () => {
    navigate('/client/dashboard');
  };

  // ------------------------------------------
  // Render — nothing to show until guards settle
  // ------------------------------------------
  if (!booking || booking.status !== 'accepted') {
    return null;
  }

  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        {/* Back */}
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleCancel}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Requests
        </button>

        {/* Header */}
        <header className={styles.header}>
          <span className={styles.ref}>{booking.requestRef}</span>
          <h1 className={styles.title}>Consultation fee</h1>
          <p className={styles.subtitle}>
            <strong>{booking.providerDisplayName}</strong> accepted your request for{' '}
            <strong>{booking.serviceTitle}</strong>. To proceed, pay the
            consultation fee so they can visit the site and evaluate the job.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Left column — fee + payment */}
          <div className={styles.left}>
            {/* Fee card */}
            <section className={styles.feeCard}>
              <div className={styles.feeLabel}>Amount due</div>
              <div className={styles.feeValue}>
                {formatPrice(booking.consultationFee)}
              </div>
              <div className={styles.feeNote}>
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>
                  <strong>Non-refundable</strong> once the provider has visited
                  your site. Refundable if they never arrive.
                </span>
              </div>

              <button
                type="button"
                className={styles.payBtn}
                onClick={handlePay}
                disabled={isPaying}
              >
                {isPaying ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Processing…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    Pay {formatPrice(booking.consultationFee)}
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={isPaying}
              >
                Cancel
              </button>

              <p className={styles.mockNote}>
                Demo mode — no real payment is processed.
              </p>
            </section>

            {/* Meta card */}
            <section className={styles.metaCard}>
              <h3 className={styles.metaTitle}>Booking summary</h3>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Provider</span>
                <span className={styles.metaValue}>
                  {booking.providerDisplayName}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Service</span>
                <span className={styles.metaValue}>{booking.serviceTitle}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Requested for</span>
                <span className={styles.metaValue}>
                  {formatDate(booking.requestedDate)}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Your suggested price</span>
                <span className={styles.metaValue}>
                  {formatPrice(booking.suggestedPrice)}
                </span>
              </div>
            </section>
          </div>

          {/* Right column — benefits + what happens next */}
          <div className={styles.right}>
            <section className={styles.benefitsCard}>
              <h3 className={styles.benefitsTitle}>
                <FontAwesomeIcon icon={faShieldAlt} />
                What the consultation fee covers
              </h3>

              <ul className={styles.benefitsList}>
                {BENEFITS.map((b) => (
                  <li key={b.title} className={styles.benefitItem}>
                    <span className={styles.benefitIcon}>
                      <FontAwesomeIcon icon={b.icon} />
                    </span>
                    <div>
                      <h4 className={styles.benefitHeading}>{b.title}</h4>
                      <p className={styles.benefitBody}>{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.nextCard}>
              <h3 className={styles.nextTitle}>
                <FontAwesomeIcon icon={faMapMarkedAlt} />
                What happens next
              </h3>
              <ol className={styles.nextList}>
                <li className={styles.nextStep}>
                  <span className={styles.stepNum}>1</span>
                  <div>
                    <strong>Provider visits your site</strong>
                    <p>You'll get a reference code to confirm the visit at your gate.</p>
                  </div>
                </li>
                <li className={styles.nextStep}>
                  <span className={styles.stepNum}>2</span>
                  <div>
                    <strong>Photos and findings are uploaded</strong>
                    <p>You can view them here and they're shared with any future provider you choose.</p>
                  </div>
                </li>
                <li className={styles.nextStep}>
                  <span className={styles.stepNum}>3</span>
                  <div>
                    <strong>Final price is proposed</strong>
                    <p>You can accept, counter once, or dispute and escalate to support.</p>
                  </div>
                </li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPayment;
