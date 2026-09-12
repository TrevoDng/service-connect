// src/components/WorkSession/WorkSessionPanel.tsx

import React, { useState } from 'react';
import type { WorkSession, Booking, ProgressStage, WorkPhoto } from '../../types';
import { generateId } from '../../utils/referenceCode';
import { formatDate, formatRelative } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCamera,
  faImages,
  faFlagCheckered,
} from '@fortawesome/free-solid-svg-icons';
import { ClockInCard } from './ClockInCard';
import { PhotoSection } from './PhotoSection';
import { ProgressStageForm } from './ProgressStageForm';
import styles from './WorkSessionPanel.module.scss';

export interface WorkSessionPanelProps {
  session: WorkSession;
  booking: Booking;
  /** Current provider's id — used on new photo records */
  providerId: string;
  onBack?: () => void;
  onClockIn: (sessionId: string) => void;
  onClockOut: (sessionId: string) => void;
  onMarkComplete?: (sessionId: string) => void;
  workReady?: boolean;

  // Photo callbacks — all receive the full updated array
  onAddBeforePhotos?: (sessionId: string, photos: WorkPhoto[]) => void;
  onDeleteBeforePhoto?: (sessionId: string, photoId: string) => void;

  onSaveProgressStage?: (sessionId: string, stage: ProgressStage) => void;
  onDeleteProgressStage?: (sessionId: string, stageId: string) => void;

  onAddFinalPhotos?: (sessionId: string, photos: WorkPhoto[]) => void;
  onDeleteFinalPhoto?: (sessionId: string, photoId: string) => void;
}

export const WorkSessionPanel: React.FC<WorkSessionPanelProps> = ({
  session,
  booking,
  providerId,
  onBack,
  onClockIn,
  onClockOut,
  onMarkComplete,
  workReady = true,
  onAddBeforePhotos,
  onDeleteBeforePhoto,
  onSaveProgressStage,
  onDeleteProgressStage,
  onAddFinalPhotos,
  onDeleteFinalPhoto,
}) => {
  // Which stage is currently being added/edited (null = no form open)
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);

  const isCompleted = session.status === 'completed';
  const editingStage = editingStageId
    ? session.progressStages.find((s) => s.id === editingStageId)
    : undefined;

  // --------------------------------------------------
  // Photo helpers
  // --------------------------------------------------
  const makePhoto = (url: string): WorkPhoto => ({
    id: generateId(),
    url,
    uploadedAt: new Date().toISOString(),
    uploadedBy: providerId,
  });

  const handleBeforeUpload = (urls: string[]) => {
    if (!onAddBeforePhotos) return;
    const additions = urls.map(makePhoto);
    onAddBeforePhotos(session.id, [...session.beforePhotos, ...additions]);
  };

  const handleFinalUpload = (urls: string[]) => {
    if (!onAddFinalPhotos) return;
    const additions = urls.map(makePhoto);
    onAddFinalPhotos(session.id, [...session.finalPhotos, ...additions]);
  };

  const handleSaveStage = (stage: ProgressStage) => {
    if (!onSaveProgressStage) return;
    onSaveProgressStage(session.id, stage);
    setIsAddingStage(false);
    setEditingStageId(null);
  };

  // --------------------------------------------------
  // Count labels
  // --------------------------------------------------
  const beforeLabel =
    session.beforePhotos.length > 0
      ? `${session.beforePhotos.length} / 5`
      : 'Not yet uploaded';
  const progressLabel =
    session.progressStages.length > 0
      ? `${session.progressStages.length} stage${session.progressStages.length === 1 ? '' : 's'}`
      : 'No stages yet';
  const finalLabel =
    session.finalPhotos.length > 0
      ? `${session.finalPhotos.length} / 5`
      : 'Not yet uploaded';

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        {onBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Back to work log"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}

        <div className={styles.headerInfo}>
          <span className={styles.ref}>{booking.requestRef}</span>
          <h3 className={styles.title}>{booking.serviceTitle}</h3>
          <p className={styles.subtitle}>
            Client: <strong>{booking.clientDisplayName}</strong>
            {booking.siteVisited && (
              <span className={styles.visited}> · Site evaluated</span>
            )}
          </p>
        </div>

        <div className={styles.headerMeta}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Last update</span>
            <span className={styles.metaValue}>{formatRelative(session.updatedAt)}</span>
          </span>
        </div>
      </div>

      {/* Clock-in card */}
      <ClockInCard
        session={session}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
        onMarkComplete={onMarkComplete}
        workReady={workReady}
      />

      {/* ---------------- PHOTO SECTIONS ---------------- */}

      {/* Before */}
      <PhotoSection
        icon={faCamera}
        title="Before work"
        countLabel={beforeLabel}
        photos={session.beforePhotos}
        onDeletePhoto={
          onDeleteBeforePhoto && !isCompleted
            ? (photoId) => onDeleteBeforePhoto(session.id, photoId)
            : undefined
        }
        onUpload={onAddBeforePhotos ? handleBeforeUpload : undefined}
        currentCount={session.beforePhotos.length}
        maxPhotos={5}
        uploadDisabled={isCompleted}
        emptyMessage="Upload 1–5 photos when you arrive on site."
      />

      {/* Progress */}
      <PhotoSection
        icon={faImages}
        title="Progress"
        countLabel={progressLabel}
        currentCount={session.progressStages.length}
        maxPhotos={Infinity}
        secondaryAction={
          onSaveProgressStage && !isCompleted && !isAddingStage && !editingStage
            ? {
                label: 'Add progress stage',
                onClick: () => setIsAddingStage(true),
              }
            : undefined
        }
      >
        {/* Add new stage form */}
        {isAddingStage && (
          <ProgressStageForm
            providerId={providerId}
            onSave={handleSaveStage}
            onCancel={() => setIsAddingStage(false)}
          />
        )}

        {/* Edit existing stage form */}
        {editingStage && (
          <ProgressStageForm
            initial={editingStage}
            providerId={providerId}
            onSave={handleSaveStage}
            onCancel={() => setEditingStageId(null)}
          />
        )}

        {/* Stage list */}
        {session.progressStages.length === 0 && !isAddingStage && (
          <div className={styles.emptyPhotos}>
            <FontAwesomeIcon icon={faImages} />
            <span>No progress stages yet.</span>
            <span className={styles.emptyHint}>
              Add a new stage any time — each stage can have 1–5 photos.
            </span>
          </div>
        )}

        {session.progressStages.length > 0 && (
          <div className={styles.progressList}>
            {session.progressStages.map((stage) => (
              <article key={stage.id} className={styles.progressStage}>
                <header className={styles.stageHeader}>
                  <h5 className={styles.stageLabel}>{stage.label}</h5>
                  <span className={styles.stageDate}>{formatDate(stage.date)}</span>

                  {onSaveProgressStage && !isCompleted && (
                    <div className={styles.stageActions}>
                      <button
                        type="button"
                        className={styles.stageActionBtn}
                        onClick={() => setEditingStageId(stage.id)}
                      >
                        Edit
                      </button>
                      {onDeleteProgressStage && (
                        <button
                          type="button"
                          className={`${styles.stageActionBtn} ${styles.dangerAction}`}
                          onClick={() => onDeleteProgressStage(session.id, stage.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </header>

                <div className={styles.photoGrid}>
                  {stage.photos.map((photo) => (
                    <figure key={photo.id} className={styles.photoTile}>
                      <img
                        src={photo.url}
                        alt={photo.caption || stage.label}
                        loading="lazy"
                      />
                      {photo.caption && <figcaption>{photo.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </PhotoSection>

      {/* Final */}
      <PhotoSection
        icon={faFlagCheckered}
        title="Final completion"
        countLabel={finalLabel}
        photos={session.finalPhotos}
        onDeletePhoto={
          onDeleteFinalPhoto && !isCompleted
            ? (photoId) => onDeleteFinalPhoto(session.id, photoId)
            : undefined
        }
        onUpload={onAddFinalPhotos ? handleFinalUpload : undefined}
        currentCount={session.finalPhotos.length}
        maxPhotos={5}
        uploadDisabled={isCompleted}
        emptyMessage="When the job is finished, upload 1–5 photos and mark the session complete."
      />
    </div>
  );
};

export default WorkSessionPanel;
