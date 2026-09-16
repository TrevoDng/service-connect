// src/components/Requests/RaiseDisputePanel.tsx

import React, { useState } from 'react';
import type { DisputeCategory, RaiseDisputeFormData } from '../../types';
import { DISPUTE_CATEGORY_LABELS } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faTimes,
  faCheck,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import { PhotoUploadButton } from '../WorkSession';
import styles from './RaiseDisputePanel.module.scss';

const MAX_PHOTOS = 3;

export interface RaiseDisputePanelProps {
  /** Name of the counterparty — shown for context */
  againstName: string;
  serviceTitle: string;
  onSubmit: (form: RaiseDisputeFormData) => void;
  onCancel: () => void;
}

// ============================================
// COMPONENT
// ============================================

export const RaiseDisputePanel: React.FC<RaiseDisputePanelProps> = ({
  againstName,
  serviceTitle,
  onSubmit,
  onCancel,
}) => {
  const [category, setCategory] = useState<DisputeCategory>('price');
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = (urls: string[]) => {
    const remaining = MAX_PHOTOS - photos.length;
    setPhotos((prev) => [...prev, ...urls.slice(0, remaining)]);
  };

  const handlePhotoDelete = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please describe what happened.');
      return;
    }
    if (reason.trim().length < 20) {
      setError('Please add a bit more detail (at least 20 characters).');
      return;
    }

    onSubmit({
      category,
      reason: reason.trim(),
      photos: photos.length > 0 ? photos : undefined,
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faGavel} className={styles.headerIcon} />
        <div>
          <h4 className={styles.title}>Raise a dispute</h4>
          <p className={styles.subtitle}>
            About <strong>{serviceTitle}</strong> with{' '}
            <strong>{againstName}</strong>
          </p>
        </div>
      </div>

      {/* Category */}
      <div className={styles.field}>
        <label htmlFor="dp-category" className={styles.label}>
          What's this about?
        </label>
        <select
          id="dp-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DisputeCategory)}
          className={styles.select}
        >
          {(Object.keys(DISPUTE_CATEGORY_LABELS) as DisputeCategory[]).map(
            (key) => (
              <option key={key} value={key}>
                {DISPUTE_CATEGORY_LABELS[key]}
              </option>
            )
          )}
        </select>
      </div>

      {/* Reason */}
      <div className={styles.field}>
        <label htmlFor="dp-reason" className={styles.label}>
          What happened?
        </label>
        <textarea
          id="dp-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Describe the situation factually. Support will read this and coordinate between both sides."
          className={styles.textarea}
        />
      </div>

      {/* Photos */}
      <div className={styles.field}>
        <div className={styles.photoHeader}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faCamera} /> Evidence (optional)
          </span>
          <span className={styles.counter}>
            {photos.length} / {MAX_PHOTOS}
          </span>
        </div>

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((url) => (
              <figure key={url} className={styles.photoTile}>
                <img src={url} alt="Evidence" />
                <button
                  type="button"
                  className={styles.photoDelete}
                  onClick={() => handlePhotoDelete(url)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </figure>
            ))}
          </div>
        )}

        {photos.length < MAX_PHOTOS && (
          <div className={styles.uploadRow}>
            <PhotoUploadButton
              onUploaded={handlePhotoUpload}
              maxFiles={MAX_PHOTOS - photos.length}
              label={photos.length === 0 ? 'Add photos' : 'Add more'}
            />
          </div>
        )}
      </div>

      <div className={styles.notice}>
        Support will be able to see the full booking history and chat with both
        sides before deciding on an outcome.
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          <FontAwesomeIcon icon={faTimes} />
          Cancel
        </button>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSubmit}
        >
          <FontAwesomeIcon icon={faGavel} />
          Submit dispute
        </button>
      </div>
    </div>
  );
};

export default RaiseDisputePanel;
