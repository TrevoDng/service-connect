// src/pages/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/booking.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './PaymentSuccess.module.scss';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!bookingId) {
      setStatus('error');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // Try for 20 seconds (10 * 2s)

    const checkPaymentStatus = async () => {
      try {
        const booking = await bookingService.getClientBookingById(bookingId);
        
        if (booking && booking.status === 'consultation_paid') {
          setStatus('success');
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          // If it takes too long, assume it failed or is pending
          setStatus('error');
          return;
        }

        // Check again in 2 seconds
        setTimeout(checkPaymentStatus, 2000);
      } catch (err) {
        setStatus('error');
      }
    };

    // Start checking
    checkPaymentStatus();
  }, [bookingId]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        
        {status === 'verifying' && (
          <div className={styles.state}>
            <FontAwesomeIcon icon={faSpinner} spin className={styles.iconSpinner} />
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your transaction with PayFast. Do not close this window.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.state}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.iconSuccess} />
            <h2>Payment Successful!</h2>
            <p>Your consultation fee has been received. The provider has been notified.</p>
            <button onClick={() => navigate('/client/dashboard?tab=requests')} className={styles.btn}>
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.state}>
            <FontAwesomeIcon icon={faXmarkCircle} className={styles.iconError} />
            <h2>Verification Pending</h2>
            <p>We couldn't immediately verify your payment. If you were charged, it will reflect on your dashboard shortly.</p>
            <button onClick={() => navigate('/client/dashboard?tab=requests')} className={styles.btn}>
              Go to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;