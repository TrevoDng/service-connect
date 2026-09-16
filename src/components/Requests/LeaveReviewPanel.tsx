// src/components/Requests/LeaveReviewPanel.tsx

import React, { useState } from 'react';
import type { ReviewFormData } from '../../types';
import { generateId } from '../../utils/referenceCode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheck, faTimes, faCamera } from '@fortawesome/free-solid-svg-icons';
import { PhotoUploadButton } from '../WorkSession';
import styles from './LeaveReviewPanel.module.scss';

// ============================================
// TAG OPTIONS
// ============================================

const TAG_OPTIONS = [
  'On time',
  'Professional',
  'Clean finish',
  'Good value',
  'Would rehire',
  'Great communication',
];

const MAX_PHOTOS = 3;

// ============================================
// PROPS
// ============================================

export interface LeaveReviewPanelProps {
  providerName: string;
  serviceTitle: string;
  /** Current provider id (for building the review record) */
  providerId: string;
  /** Current client id */
  clientId: string;
  clientDisplayName: string;
  bookingId: string;
  /** Called with the completed form data */
  onSubmit: (review: {
    id: string;
    formData: ReviewFormData;
  }) => void;
  onCancel: () => void;
}

// ============================================
// COMPONENT
// ============================================

export const LeaveReviewPanel: React.FC<LeaveReviewPanelProps> = ({
  providerName,
  serviceTitle,
  providerId: _providerId,
  clientId: _clientId,
  clientDisplayName: _clientDisplayName,
  bookingId: _bookingId,
  onSubmit,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoUpload = (urls: string[]) => {
    const remaining = MAX_PHOTOS - photos.length;
    setPhotos((prev) => [...prev, ...urls.slice(0, remaining)]);
  };

  const handlePhotoDelete = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please pick a star rating.');
      return;
    }

    const formData: ReviewFormData = {
      rating,
      comment: comment.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
      tags: tags.length > 0 ? tags : undefined,
      wouldRecommend,
    };

    onSubmit({ id: generateId(), formData });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h4 className={styles.title}>Leave a review</h4>
        <p className={styles.subtitle}>
          How was your experience with <strong>{providerName}</strong> for{' '}
          <strong>{serviceTitle}</strong>?
        </p>
      </div>

      {/* Stars */}
      <div className={styles.field}>
        <span className={styles.label}>Your rating</span>
        <div
          className={styles.stars}
          onMouseLeave={() => setHovered(0)}
          role="radiogroup"
          aria-label="Star rating"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.star} ${
                n <= (hovered || rating) ? styles.starFilled : ''
              }`}
              onMouseEnter={() => setHovered(n)}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
            >
              <FontAwesomeIcon icon={faStar} />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className={styles.field}>
        <label htmlFor="lr-comment" className={styles.label}>
          Your experience (optional)
        </label>
        <textarea
          id="lr-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="What went well? Anything other clients should know?"
          className={styles.textarea}
        />
        <span className={styles.counter}>{comment.length} / 500</span>
      </div>

      {/* Tags */}
      <div className={styles.field}>
        <span className={styles.label}>Tags (optional)</span>
        <div className={styles.tags}>
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.tag} ${
                tags.includes(tag) ? styles.tagActive : ''
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className={styles.field}>
        <div className={styles.photoHeader}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faCamera} /> Photos (optional)
          </span>
          <span className={styles.counter}>
            {photos.length} / {MAX_PHOTOS}
          </span>
        </div>

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((url) => (
              <figure key={url} className={styles.photoTile}>
                <img src={url} alt="Review photo" />
                <button
                  type="button"
                  className={styles.photoDelete}
                  onClick={() => handlePhotoDelete(url)}
                  aria-label="Remove photo"
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

      {/* Recommend */}
      <label className={styles.recommendRow}>
        <input
          type="checkbox"
          checked={wouldRecommend}
          onChange={(e) => setWouldRecommend(e.target.checked)}
          className={styles.checkbox}
        />
        <span>I would recommend this provider to others</span>
      </label>

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
          disabled={rating === 0}
        >
          <FontAwesomeIcon icon={faCheck} />
          Post review
        </button>
      </div>
    </div>
  );
};

export default LeaveReviewPanel;
