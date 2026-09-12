// src/components/Chat/ChatPanel.tsx

import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatThread } from '../../types';
import { getMessagesByThread } from '../../data/demoChat';
import { generateId } from '../../utils/referenceCode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faComments,
} from '@fortawesome/free-solid-svg-icons';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import styles from './ChatPanel.module.scss';

export interface ChatPanelProps {
  /** The thread being viewed. `null` shows the empty state. */
  thread: ChatThread | null;
  /** Which side the current viewer is on */
  viewerRole: 'CLIENT' | 'PROVIDER';
  /** Current viewer's user id (used to decide own vs other bubbles) */
  viewerUserId: string;
  /** Mobile-only: fired by the back button to return to the list */
  onBack?: () => void;
  /** Optional: fired when the client clicks "Book This Provider" */
  onBookProvider?: (providerId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  thread,
  viewerRole,
  viewerUserId,
  onBack,
  onBookProvider,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load messages when the thread changes
  useEffect(() => {
    if (!thread) {
      setMessages([]);
      return;
    }
    const loaded = getMessagesByThread(thread.id);
    setMessages(loaded);
  }, [thread]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!thread) return;
    const newMessage: ChatMessage = {
      id: generateId(),
      threadId: thread.id,
      senderId: viewerUserId,
      text,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // ------------------------------------------
  // Empty state
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
  // Resolve the "other" participant
  // ------------------------------------------
  const other = viewerRole === 'CLIENT' ? thread.provider : thread.client;

  // ------------------------------------------
  // Render
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
            <span>{other.displayName}</span>
            {viewerRole === 'CLIENT' && other.providerVerified && (
              <FontAwesomeIcon icon={faCheckCircle} className={styles.verified} />
            )}
          </div>

          {viewerRole === 'CLIENT' && other.providerRating !== undefined && (
            <div className={styles.headerMeta}>
              <span className={styles.rating}>⭐ {other.providerRating.toFixed(1)}</span>
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
                msg.senderId === viewerUserId
                  ? 'You'
                  : other.displayName
              }
              isOwn={msg.senderId === viewerUserId}
              senderAvatarGradient={other.avatarGradient}
            />
          ))
        )}
      </div>

      {/* Composer */}
      <ChatComposer onSend={handleSend} />
    </div>
  );
};

export default ChatPanel;
