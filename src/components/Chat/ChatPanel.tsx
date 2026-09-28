
// src/components/Chat/ChatPanel.tsx

import React, { useEffect, useRef } from 'react';
import type { ChatThread } from '../../types';
import { useChatThread } from '../../hooks/useChatThread';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
  faEye,
  faArrowLeft,
  faCheckCircle,
  faComments,
} from '@fortawesome/free-solid-svg-icons';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import styles from './ChatPanel.module.scss';

// ============================================
// PROPS
// ============================================

export interface ChatPanelProps {
  thread: ChatThread | null;
  viewerRole: 'CLIENT' | 'PROVIDER';
  /**
   * Effective chat user id for the viewer, or `null` for observer mode.
   *
   * NOTE: For backward compatibility with the current MessagesView, we
   * also accept the legacy string `'observer'` and treat it as null.
   * Once MessagesView is updated (Step 7), this legacy handling can go.
   */
  viewerUserId: string | null;
  observerMode?: boolean;
  onBack?: () => void;
  onBookProvider?: (providerId: string) => void;
}

// ============================================
// HELPERS
// ============================================

/**
 * Normalise the legacy `'observer'` sentinel to `null` so the hook can
 * cleanly treat it as "no authenticated viewer".
 */
const normaliseViewerId = (raw: string | null): string | null => {
  if (!raw) return null;
  if (raw === 'observer') return null;
  return raw;
};

// ============================================
// COMPONENT
// ============================================

export const ChatPanel: React.FC<ChatPanelProps> = ({
  thread,
  viewerRole,
  viewerUserId,
  observerMode = false,
  onBack,
  onBookProvider,
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const threadId = thread?.id ?? null;
  const effectiveViewerId = observerMode ? null : normaliseViewerId(viewerUserId);

  // ------------------------------------------
  // HOOK — live messages + send + auto-mark-read
  // ------------------------------------------
  // The hook handles: loading, cross-tab subscription, mark-read on
  // open, and safe no-ops when threadId or viewerId is missing.
  const { messages, send } = useChatThread(threadId, effectiveViewerId);

  // ------------------------------------------
  // AUTO-SCROLL
  // ------------------------------------------
  // Jump to the bottom whenever the message list grows or the thread
  // changes. Keeps the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, threadId]);

  // ------------------------------------------
  // EMPTY STATE — no thread selected
  // ------------------------------------------
  if (!thread) {
    return (
      <div className={styles.emptyPanel}>
        <FontAwesomeIcon icon={faComments} className={styles.emptyIcon} />
        <h3>Select a conversation</h3>
        <p>Choose a thread from the list to start chatting.</p>
      </div>
    );
  }

  // ------------------------------------------
  // RESOLVE THE "OTHER" PARTICIPANT
  // ------------------------------------------
  const other = viewerRole === 'CLIENT' ? thread.provider : thread.client;

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        {onBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}

        <div
          className={styles.headerAvatar}
          style={{
            background:
              other.avatarGradient ||
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          aria-hidden="true"
        >
          {(other.displayName.split(/\s+/)[0]?.charAt(0) || '') +
            (other.displayName.split(/\s+/).slice(-1)[0]?.charAt(0) || '')}
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.headerName}>
            {viewerRole === 'CLIENT' ? (
              <button
                type="button"
                className={styles.headerNameLink}
                onClick={() => navigate(`/providers/${thread.providerId}`)}
              >
                {other.displayName}
              </button>
            ) : (
              <span>{other.displayName}</span>
            )}
            {viewerRole === 'CLIENT' && other.providerVerified && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.verified}
              />
            )}
          </div>

          {viewerRole === 'CLIENT' && other.providerRating !== undefined && (
            <div className={styles.headerMeta}>
              <span className={styles.rating}>
                ⭐ {other.providerRating.toFixed(1)}
              </span>
              {other.providerCompletedJobs !== undefined && (
                <span>· {other.providerCompletedJobs} jobs completed</span>
              )}
            </div>
          )}

          {viewerRole === 'PROVIDER' && (
            <div className={styles.headerMeta}>
              <span>Client</span>
            </div>
          )}
        </div>

        {/* Client-only: book this provider */}
        {viewerRole === 'CLIENT' && onBookProvider && (
          <button
            type="button"
            className={styles.bookBtn}
            onClick={() => onBookProvider(thread.providerId)}
          >
            Book This Provider
          </button>
        )}
      </div>

      {/* Message list */}
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet. Say hello 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              senderName={
                msg.senderId === effectiveViewerId ? 'You' : other.displayName
              }
              isOwn={msg.senderId === effectiveViewerId}
              senderAvatarGradient={other.avatarGradient}
            />
          ))
        )}
      </div>

      {/* Composer — hidden in observer mode */}
      {observerMode ? (
        <div className={styles.readOnlyBanner}>
          <FontAwesomeIcon icon={faEye} />
          <span>Read-only — support view</span>
        </div>
      ) : (
        <ChatComposer onSend={send} />
      )}
    </div>
  );
};

export default ChatPanel;

