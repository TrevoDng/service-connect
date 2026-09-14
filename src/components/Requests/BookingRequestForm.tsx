// src/components/Requests/BookingRequestForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking, WorkPhoto } from '../../types';
import { useAuth } from '../../account/context/AuthContext';
import { addLocalBooking } from '../../utils/localBookings';
import { generateId, buildRequestRef } from '../../utils/referenceCode';
import { formatPrice } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faDollarSign,
  faInfoCircle,
  faPaperPlane,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { PhotoUploadButton } from '../WorkSession';
import styles from './BookingRequestForm.module.scss';

export interface BookingRequestFormProps {
  /** Service being requested */
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;

  /** Provider details */
  providerId: string;
  providerDisplayName: string;

  /** Client — resolved from auth, but passed in for clarity */
  clientId: string;
  clientDisplayName: string;

  /** Called after the booking is persisted */
  onSuccess?: (booking: Booking) => void;
}

const MAX_PHOTOS = 5;

export const BookingRequestForm: React.FC<BookingRequestFormProps> = ({
  serviceId,
  serviceTitle,
  serviceCategory,
  providerId,
  providerDisplayName,
  clientId,
  clientDisplayName,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingDate, setBookingDate] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // ------------------------------------------
  // Photo handlers
  // ------------------------------------------
  const handlePhotoUpload = (urls: string[]) => {
    const now = new Date().toISOString();
    const remaining = MAX_PHOTOS - photos.length;
    const additions: WorkPhoto[] = urls.slice(0, remaining).map((url) => ({
      id: generateId(),
      url,
      uploadedAt: now,
      uploadedBy: user?.id || clientId,
    }));
    setPhotos((prev) => [...prev, ...additions]);
  };

  const handlePhotoDelete = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // ------------------------------------------
  // Submit
  // ------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bookingDate) {
      setError('Please pick a date and time for the service.');
      return;
    }

    const priceNum = parseFloat(suggestedPrice.replace(/[^0-9.]/g, ''));
    if (!suggestedPrice || isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a suggested price greater than 0.');
      return;
    }

    setBusy(true);
    try {
      const now = new Date().toISOString();
      const booking: Booking = {
        id: generateId(),
        requestRef: buildRequestRef(
          // Rough sequence: demo bookings + local ones + 100 to avoid collision
          Math.floor(Math.random() * 9000) + 1000,
          2026
        ),
        clientId,
        clientDisplayName,
        providerId,
        providerDisplayName,
        serviceTitle,
        serviceCategory,
        description: notes.trim() || `Request for ${serviceTitle}`,
        requestPhotos: photos.map((p) => p.url),
        requestedDate: new Date(bookingDate).toISOString(),
        createdAt: now,
        updatedAt: now,
        status: 'requested',
        suggestedPrice: priceNum,
        consultationFee: 0,
        priceHistory: [
          {
            stage: 'suggested',
            amount: priceNum,
            at: now,
            byUserId: clientId,
            note: 'Client-suggested price — not binding.',
          },
        ],
        siteVisited: false,
        clientSharedFields: {
          displayName: true,
          phone: false,
          address: false,
          gateCode: false,
          specialInstructions: false,
        },
      };

      addLocalBooking(booking);

      if (onSuccess) {
        onSuccess(booking);
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      setError('Something went wrong while sending your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const remaining = MAX_PHOTOS - photos.length;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Date */}
      <div className={styles.field}>
        <label htmlFor="brf-date" className={styles.label}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          Preferred date &amp; time
        </label>
        <input
          id="brf-date"
          type="datetime-local"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      {/* Suggested price */}
      <div className={styles.field}>
        <label htmlFor="brf-price" className={styles.label}>
          <FontAwesomeIcon icon={faDollarSign} />
          Your suggested price (ZAR)
        </label>
        <div className={styles.priceRow}>
          <span className={styles.pricePrefix}>R</span>
          <input
            id="brf-price"
            type="number"
            min="1"
            step="1"
            value={suggestedPrice}
            onChange={(e) => setSuggestedPrice(e.target.value)}
            placeholder="e.g. 500"
            className={styles.input}
            required
          />
        </div>
        <p className={styles.helper}>
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>
             This is only a suggestion. The final price will be agreed after{' '}
          <strong>{providerDisplayName}</strong> evaluates the job on-site.
          </span>
</p>
      </div>

      {/* Photos */}
      <div className={styles.field}>
        <div className={styles.photoHeader}>
          <span className={styles.label}>Photos of the job (optional)</span>
          <span className={styles.photoCount}>
            {photos.length} / {MAX_PHOTOS}
          </span>
        </div>
        <p className={styles.helper}>
          <FontAwesomeIcon icon={faInfoCircle} />
          Adding a few photos helps the provider understand the job before the
          site visit.
        </p>

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((photo) => (
              <figure key={photo.id} className={styles.photoTile}>
                <img src={photo.url} alt="Job" />
                <button
                  type="button"
                  className={styles.photoDelete}
                  onClick={() => handlePhotoDelete(photo.id)}
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
      </div>

      {/* Notes */}
      <div className={styles.field}>
        <label htmlFor="brf-notes" className={styles.label}>
          Notes for the provider
        </label>
        <textarea
          id="brf-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Describe the job, any special requirements, access details…"
          className={styles.textarea}
        />
      </div>

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Submit */}
      <button type="submit" className={styles.submitBtn} disabled={busy}>
        <FontAwesomeIcon icon={busy ? faSpinner : faPaperPlane} spin={busy} />
        {busy ? 'Sending…' : 'Send request'}
      </button>

      <p className={styles.disclaimer}>
        By sending this request you agree to be contacted by the provider for
        scheduling. Nothing is charged now.
      </p>
    </form>
  );
};

export default BookingRequestForm;
