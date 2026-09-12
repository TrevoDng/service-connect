// src/components/WorkSession/PhotoSection.tsx

import React from 'react';
import type { WorkPhoto } from '../../types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PhotoGrid } from './PhotoGrid';
import { PhotoUploadButton } from './PhotoUploadButton';
import styles from './PhotoSection.module.scss';

export interface PhotoSectionProps {
  icon: IconDefinition;
  title: string;
  /** e.g. "3 / 5" or "Not yet uploaded" */
  countLabel: string;

  /** Photos to show */
  photos?: WorkPhoto[];
  /** Optional delete handler for individual photos */
  onDeletePhoto?: (photoId: string) => void;

  /** Upload slot — when provided, renders a PhotoUploadButton */
  onUpload?: (urls: string[]) => void;
  /** Max photos allowed */
  maxPhotos?: number;
  /** Current number of photos (used to compute remaining slots) */
  currentCount?: number;
  /** Disable the upload button entirely */
  uploadDisabled?: boolean;

  /** Optional secondary button (e.g. "Add progress stage") */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };

  /** Empty-state message when there are no photos and no children */
  emptyMessage?: string;

  /** Free-form children rendered between the header and the grid (e.g. ProgressStageForm) */
  children?: React.ReactNode;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({
  icon,
  title,
  countLabel,
  photos,
  onDeletePhoto,
  onUpload,
  maxPhotos = 5,
  currentCount,
  uploadDisabled = false,
  secondaryAction,
  emptyMessage,
  children,
}) => {
  const count = currentCount ?? photos?.length ?? 0;
  const remaining = Math.max(0, maxPhotos - count);
  const canUpload = !!onUpload && remaining > 0 && !uploadDisabled;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        <h4 className={styles.title}>{title}</h4>

        <span className={styles.count}>{countLabel}</span>

        <div className={styles.headerActions}>
          {secondaryAction && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label}
            </button>
          )}

          {canUpload && (
            <PhotoUploadButton
              onUploaded={onUpload!}
              maxFiles={remaining}
              label={count === 0 ? 'Upload' : 'Add more'}
            />
          )}
        </div>
      </header>

      {children}

      {photos && photos.length > 0 && (
        <PhotoGrid photos={photos} onDelete={onDeletePhoto} />
      )}

      {photos && photos.length === 0 && !children && emptyMessage && (
        <div className={styles.empty}>{emptyMessage}</div>
      )}
    </section>
  );
};

export default PhotoSection;
