// src/components/WorkSession/ProgressStageForm.tsx

import React, { useState } from 'react';
import { generateId } from '../../utils/referenceCode';
import type { WorkPhoto, ProgressStage } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { PhotoUploadButton } from './PhotoUploadButton';
import { PhotoGrid } from './PhotoGrid';
import styles from './ProgressStageForm.module.scss';

const MAX_PHOTOS = 5;

export interface ProgressStageFormProps {
  /** Existing stage being edited; omit to create a new one */
  initial?: ProgressStage;
  /** Current provider user id (used on new photo records) */
  providerId: string;
  /** Fired with the completed stage when the user saves */
  onSave: (stage: ProgressStage) => void;
  /** Fired when the user cancels */
  onCancel: () => void;
}

export const ProgressStageForm: React.FC<ProgressStageFormProps> = ({
  initial,
  providerId,
  onSave,
  onCancel,
}) => {
  const [label, setLabel] = useState(initial?.label || '');
  const [date, setDate] = useState(
    initial
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [photos, setPhotos] = useState<WorkPhoto[]>(initial?.photos || []);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = MAX_PHOTOS - photos.length;

  const handleUploaded = (urls: string[]) => {
    const now = new Date().toISOString();
    const additions: WorkPhoto[] = urls.slice(0, remainingSlots).map((url) => ({
      id: generateId(),
      url,
      uploadedAt: now,
      uploadedBy: providerId,
    }));
    setPhotos((prev) => [...prev, ...additions]);
    setError(null);
  };

  const handleDelete = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSave = () => {
    if (!label.trim()) {
      setError('Please add a short label for this stage.');
      return;
    }
    if (photos.length === 0) {
      setError('Add at least one photo.');
      return;
    }

    const stage: ProgressStage = {
      id: initial?.id || generateId(),
      label: label.trim(),
      date: new Date(date).toISOString(),
      photos,
    };

    onSave(stage);
  };

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="stage-label" className={styles.label}>
          Stage label
        </label>
        <input
          id="stage-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Day 2 — waterproofing applied"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="stage-date" className={styles.label}>
          Date
        </label>
        <input
          id="stage-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.photoHeader}>
          <span className={styles.label}>Photos</span>
          <span className={styles.photoCount}>
            {photos.length} / {MAX_PHOTOS}
          </span>
        </div>

        <PhotoGrid photos={photos} onDelete={handleDelete} />

        {remainingSlots > 0 && (
          <div className={styles.uploadRow}>
            <PhotoUploadButton
              onUploaded={handleUploaded}
              maxFiles={remainingSlots}
              label={photos.length === 0 ? 'Add photos' : 'Add more'}
            />
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          <FontAwesomeIcon icon={faTimes} />
          Cancel
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          <FontAwesomeIcon icon={faCheck} />
          {initial ? 'Save changes' : 'Add stage'}
        </button>
      </div>
    </div>
  );
};

export default ProgressStageForm;
