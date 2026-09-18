// src/components/Requests/WizardStep.tsx

import React, { useState } from 'react';
import type { Booking, ViewerRole } from '../../types';
import {
  MILESTONES,
  getMilestoneState,
  getWizardStep,
} from './wizardSteps';
import type { WizardAction } from './wizardSteps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faGavel,
  faPlay,
  faHardHat,
} from '@fortawesome/free-solid-svg-icons';
import styles from './WizardStep.module.scss';

// ============================================
// PROPS
// ============================================

export interface WizardStepProps {
  booking: Booking;
  viewerRole: ViewerRole;

  /** Whether the full RequestCard is currently expanded underneath */
  expanded: boolean;
  onToggleExpanded: () => void;

  /** Action dispatcher — key matches the action config from wizardSteps */
  onAction: (actionKey: string, booking: Booking) => void;

  /** Hide the "Raise a dispute" link (e.g. for staff view) */
  hideDisputeLink?: boolean;

  /** Provider picked "Start work" from the choice panel */
  onStartWork?: (booking: Booking) => void;
  /** Provider picked "Show progress" */
  onShowProgress?: (booking: Booking) => void;
}

// ============================================
// COMPONENT
// ============================================

export const WizardStep: React.FC<WizardStepProps> = ({
  booking,
  viewerRole,
  expanded,
  onToggleExpanded,
  onAction,
  hideDisputeLink = false,
  onStartWork,
  onShowProgress,
}) => {
  const [showWorkChoice, setShowWorkChoice] = useState(false);

  const role: 'CLIENT' | 'PROVIDER' =
    viewerRole === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';

  const step = getWizardStep(booking, role);
  const milestone = getMilestoneState(booking.status);

  // ------------------------------------------
  // WORK-SESSION CHOICE INTERCEPT
  // ------------------------------------------
  // When the provider is on step 5 (price_agreed), the wizard's primary
  // action is "view-work-session". Instead of firing that action directly,
  // we open the two-button choice panel below the actions.
  const isProviderAtPriceAgreed =
    viewerRole === 'PROVIDER' &&
    booking.status === 'price_agreed' &&
    step.primaryAction?.key === 'view-work-session';

  const handlePrimaryClick = (action: WizardAction) => {
    if (isProviderAtPriceAgreed && action.key === 'view-work-session') {
      setShowWorkChoice(true);
      return;
    }
    onAction(action.key, booking);
  };

  // ------------------------------------------
  // ACTION RENDER
  // ------------------------------------------
  const renderAction = (action: WizardAction, key: 'primary' | 'secondary') => (
    <button
      key={key}
      type="button"
      className={`${styles.actionBtn} ${styles[action.variant]}`}
      onClick={() =>
        key === 'primary'
          ? handlePrimaryClick(action)
          : onAction(action.key, booking)
      }
    >
      {action.label}
    </button>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`${styles.wizard} ${step.passive ? styles.passive : ''}`}>
      {/* Progress dots */}
      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          Step {milestone.current + 1} of {MILESTONES.length}
        </span>
        <div
          className={styles.dots}
          role="progressbar"
          aria-valuenow={milestone.current + 1}
          aria-valuemin={1}
          aria-valuemax={MILESTONES.length}
        >
          {MILESTONES.map((m, i) => {
            const isDone = milestone.completed.includes(i);
            const isCurrent = i === milestone.current;
            return (
              <span
                key={m.key}
                className={`${styles.dot} ${isDone ? styles.dotDone : ''} ${
                  isCurrent ? styles.dotCurrent : ''
                }`}
                title={m.label}
              >
                {isDone ? <FontAwesomeIcon icon={faCheck} /> : null}
              </span>
            );
          })}
        </div>
      </div>

      {/* Main step body */}
      <div className={styles.body}>
        <div className={styles.icon}>
          <FontAwesomeIcon icon={step.icon} />
        </div>
        <div className={styles.text}>
          <h4 className={styles.title}>{step.title}</h4>
          {step.body && <p className={styles.bodyText}>{step.body}</p>}
        </div>
      </div>

      {/* Actions */}
      {!step.passive && (step.primaryAction || step.secondaryAction) && (
        <div className={styles.actions}>
          {step.primaryAction && renderAction(step.primaryAction, 'primary')}
          {step.secondaryAction && renderAction(step.secondaryAction, 'secondary')}
        </div>
      )}

      {/* Work-session choice panel (Step 13.2) */}
      {showWorkChoice && (
        <div className={styles.choicePanel}>
          <h5 className={styles.choiceTitle}>How do you want to proceed?</h5>
          <p className={styles.choiceHint}>
            You've agreed the price. Clock in when you're on site, or just view
            your progress so far.
          </p>

          <div className={styles.choiceActions}>
            <button
              type="button"
              className={styles.choiceBtnPrimary}
              onClick={() => {
                setShowWorkChoice(false);
                if (onStartWork) onStartWork(booking);
              }}
            >
              <FontAwesomeIcon icon={faPlay} />
              Start work
            </button>

            <button
              type="button"
              className={styles.choiceBtnSecondary}
              onClick={() => {
                setShowWorkChoice(false);
                if (onShowProgress) onShowProgress(booking);
              }}
            >
              <FontAwesomeIcon icon={faHardHat} />
              Show progress
            </button>
          </div>

          <button
            type="button"
            className={styles.choiceCancel}
            onClick={() => setShowWorkChoice(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Passive hint */}
      {step.passive && (
        <div className={styles.passiveHint}>
          <span className={styles.pulseDot} />
          <span>Waiting on the other party — no action needed right now.</span>
        </div>
      )}

      {/* Footer: expand toggle + dispute link */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={onToggleExpanded}
          aria-expanded={expanded}
        >
          <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
          {expanded ? 'Hide full details' : 'Show full details'}
        </button>

        {!hideDisputeLink && !step.passive && booking.status !== 'requested' && (
          <button
            type="button"
            className={styles.disputeLink}
            onClick={() => onAction('open-dispute', booking)}
          >
            <FontAwesomeIcon icon={faGavel} />
            Something wrong? Raise a dispute
          </button>
        )}
      </div>
    </div>
  );
};

export default WizardStep;
