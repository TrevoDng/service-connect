// src/components/WorkSession/PhotoUploadButton.tsx

import React, { useRef, useState } from 'react';
import { processImageBatch } from '../../utils/imageUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './PhotoUploadButton.module.scss';

export interface PhotoUploadButtonProps {
  /** Fired with an array of blob URLs after upload completes */
  onUploaded: (urls: string[]) => void;
  /** Maximum number of files per click */
  maxFiles?: number;
  /** Disable button (e.g. when the section is full or the session is locked) */
  disabled?: boolean;
  /** Button label */
  label?: string;
  /** Optional: fired when some files fail validation */
  onError?: (rejected: string[]) => void;
}

export const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onUploaded,
  maxFiles = 5,
  disabled = false,
  label = 'Add photos',
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const trimmed = files.slice(0, maxFiles);
    setBusy(true);
    try {
      const { urls, rejected } = await processImageBatch(trimmed);
      if (urls.length > 0) onUploaded(urls);
      if (rejected.length > 0 && onError) onError(rejected);
    } finally {
      setBusy(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input so the same file can be selected again later
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files || []);
    handleFiles(files);
  };

  return (
    <div
      className={`${styles.wrapper} ${isDragging ? styles.dragging : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        className={styles.button}
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        disabled={disabled || busy}
      >
        <FontAwesomeIcon icon={busy ? faSpinner : faCamera} spin={busy} />
        <span>{busy ? 'Processing…' : label}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleInputChange}
        className={styles.hiddenInput}
        tabIndex={-1}
      />
    </div>
  );
};

export default PhotoUploadButton;
