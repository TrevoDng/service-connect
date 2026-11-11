// src/components/Support/StaffSupportPanel.tsx
//
// Staff-side ticket detail. Shows requester, status, and action buttons
// (Claim / Release / Close / Reopen) driven by status + isMine. Composer
// is enabled only when `ticket.canReply` — every other case falls through
// to a read-only banner with the relevant reason.

import React, { useEffect, useRef, useState } from 'react';
import { useStaffSupportMessages } from '../../hooks/useStaffSupportMessages';
import {
  staffSupportService,
  type StaffSupportTicket,
} from '../../services/staffSupport.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadset,
  faArrowLeft,
  faLock,
  faUserCheck,
  faUserMinus,
  faUnlock,
  faSpinner,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { ChatComposer } from '../Chat';
import { StaffSupportBubble } from './StaffSupportBubble';
import styles from './StaffSupportPanel.module.scss';

export interface StaffSupportPanelProps {
  ticket: StaffSupportTicket | null;
  viewerId: string;
  onBack?: () => void;
  /** Called after claim / release / close / reopen so the parent can refresh. */
  onChanged?: () => void;
}

const statusLabel = (s: StaffSupportTicket['status']): string => {
  if (s === 'open') return 'Open';
  if (s === 'claimed') return 'Claimed';
  return 'Closed';
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || '?';
};

type Action = 'claim' | 'release' | 'close' | 'reopen';

export const StaffSupportPanel: React.FC<StaffSupportPanelProps> = ({
  ticket,
  viewerId,
  onBack,
  onChanged,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { messages, send } = useStaffSupportMessages(ticket?.id ?? null);
  const [acting, setActing] = useState<Action | null>(null);

  // Auto-scroll on new messages / ticket change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, ticket?.id]);

  // Mark requester messages read — only when this ticket is mine
  useEffect(() => {
    if (!ticket || !ticket.isMine || ticket.unreadCount === 0) return;
    staffSupportService.markRead(ticket.id).catch(() => {
      /* non-fatal — next poll will retry */
    });
  }, [ticket?.id, ticket?.isMine, ticket?.unreadCount]);

  if (!ticket) {
    return (
      <div className={styles.emptyPanel}>
        <FontAwesomeIcon icon={faHeadset} className={styles.emptyIcon} />
        <h3>Select a support ticket</h3>
        <p>Choose a ticket from the list to review or reply.</p>
      </div>
    );
  }

  const isClosed = ticket.status === 'closed';
  const isClaimed = ticket.status === 'claimed';
  const isMine = ticket.isMine;

  const handleAction = async (action: Action) => {
    if (acting) return;
    setActing(action);
    try {
      if (action === 'claim') await staffSupportService.claim(ticket.id);
      else if (action === 'release') await staffSupportService.release(ticket.id);
      else if (action === 'close') await staffSupportService.close(ticket.id);
      else if (action === 'reopen') await staffSupportService.reopen(ticket.id);
      onChanged?.();
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} ticket`);
    } finally {
      setActing(null);
    }
  };

  // Read-only reason — shown when canReply is false
  let readOnlyReason: string | null = null;
  let readOnlyIcon = faEye;
  if (isClosed) {
    readOnlyReason = 'This ticket is closed. Reopen it to reply.';
    readOnlyIcon = faLock;
  } else if (!isClaimed && !isMine) {
    readOnlyReason = 'Claim this ticket to reply.';
    readOnlyIcon = faUserCheck;
  } else if (isClaimed && !isMine) {
    readOnlyReason = `Being handled by ${
      ticket.assignedStaffDisplayName || 'another staff member'
    }. You can watch but not reply.`;
    readOnlyIcon = faEye;
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        {onBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Back to tickets"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}

        <div
          className={styles.requesterAvatar}
          style={{ background: ticket.requester.avatarGradient }}
          aria-hidden="true"
        >
          {getInitials(ticket.requester.displayName)}
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.headerName}>
            <span className={styles.requesterName}>
              {ticket.requester.displayName}
            </span>
            <span
              className={`${styles.roleTag} ${
                styles[`role_${ticket.requester.role}`]
              }`}
            >
              {ticket.requester.role === 'CLIENT' ? 'Client' : 'Provider'}
            </span>
            <span
              className={`${styles.statusBadge} ${styles[`status_${ticket.status}`]}`}
            >
              {statusLabel(ticket.status)}
            </span>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.headerSubject}>
              {ticket.subject?.trim() || 'Support ticket'}
            </span>
            {isMine && isClaimed && (
              <span className={styles.assignedBadge}>
                <FontAwesomeIcon icon={faUserCheck} /> Assigned to you
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {ticket.status === 'open' && (
            <button
              type="button"
              className={styles.claimBtn}
              onClick={() => handleAction('claim')}
              disabled={!!acting}
            >
              <FontAwesomeIcon
                icon={acting === 'claim' ? faSpinner : faUserCheck}
                spin={acting === 'claim'}
              />
              Claim
            </button>
          )}
          {isMine && !isClosed && (
            <>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => handleAction('release')}
                disabled={!!acting}
              >
                <FontAwesomeIcon
                  icon={acting === 'release' ? faSpinner : faUserMinus}
                  spin={acting === 'release'}
                />
                Release
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() => handleAction('close')}
                disabled={!!acting}
              >
                <FontAwesomeIcon
                  icon={acting === 'close' ? faSpinner : faLock}
                  spin={acting === 'close'}
                />
                Close
              </button>
            </>
          )}
          {isClosed && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => handleAction('reopen')}
              disabled={!!acting}
            >
              <FontAwesomeIcon
                icon={acting === 'reopen' ? faSpinner : faUnlock}
                spin={acting === 'reopen'}
              />
              Reopen
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages in this ticket yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <StaffSupportBubble
              key={msg.id}
              message={msg}
              ticket={ticket}
              viewerId={viewerId}
            />
          ))
        )}
      </div>

      {/* Composer / banner */}
      {ticket.canReply ? (
        <ChatComposer
          onSend={(text, attachments) => {
            send(text, attachments).catch(() => {
              /* surfaced via next poll */
            });
          }}
          threadId={ticket.id}
          uploadEntityType="support"
          placeholder="Reply as ServiceConnect Support…"
        />
      ) : readOnlyReason ? (
        <div className={styles.readOnlyBanner}>
          <FontAwesomeIcon icon={readOnlyIcon} />
          <span>{readOnlyReason}</span>
        </div>
      ) : null}
    </div>
  );
};

export default StaffSupportPanel;