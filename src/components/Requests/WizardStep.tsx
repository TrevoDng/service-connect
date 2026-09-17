// src/components/Requests/WizardStep.tsx

import React from 'react';
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
}) => {
  const role: 'CLIENT' | 'PROVIDER' =
    viewerRole === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';

  const step = getWizardStep(booking, role);
  const milestone = getMilestoneState(booking.status);

  const renderAction = (action: WizardAction, key: string) => (
    <button
      key={key}
      type="button"
      className={`${styles.actionBtn} ${styles[action.variant]}`}
      onClick={() => onAction(action.key, booking)}
    >
      {action.label}
    </button>
  );

  return (
    <div className={`${styles.wizard} ${step.passive ? styles.passive : ''}`}>
      {/* Progress dots */}
      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          Step {milestone.current + 1} of {MILESTONES.length}
        </span>
        <div className={styles.dots} role="progressbar" aria-valuenow={milestone.current + 1} aria-valuemin={1} aria-valuemax={MILESTONES.length}>
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
