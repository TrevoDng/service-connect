// src/components/WorkSession/PhotoGrid.tsx

import React from 'react';
import type { WorkPhoto } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './PhotoGrid.module.scss';

export interface PhotoGridProps {
  photos: WorkPhoto[];
  /** When provided, each tile shows a delete button */
  onDelete?: (photoId: string) => void;
  /** Optional empty-state message shown when the array is empty */
  emptyMessage?: string;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onDelete,
  emptyMessage,
}) => {
  if (photos.length === 0 && emptyMessage) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.grid}>
      {photos.map((photo) => (
        <figure key={photo.id} className={styles.tile}>
          <img src={photo.url} alt={photo.caption || 'Work photo'} loading="lazy" />
          {onDelete && (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => onDelete(photo.id)}
              aria-label="Delete photo"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
          {photo.caption && <figcaption>{photo.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
};

export default PhotoGrid;
