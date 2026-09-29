
// src/components/Chat/MessagesView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../account/context/AuthContext';
import { resolveChatUserId } from '../../utils/chatIdentity';
import { useChatThreads } from '../../hooks/useChatThreads';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faEye } from '@fortawesome/free-solid-svg-icons';
import { ChatPanel } from './ChatPanel';
import { ChatThreadListItem } from './ChatThreadListItem';
import styles from './MessagesView.module.scss';

// ============================================
// PROPS
// ============================================

export interface MessagesViewProps {
  /** Which side the current viewer is on. Ignored when observerMode is true. */
  viewerRole: 'CLIENT' | 'PROVIDER';
  /** Optional: fired when the client clicks "Book This Provider" */
  onBookProvider?: (providerId: string) => void;
  /** Support mode — shows all threads, read-only */
  observerMode?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const MessagesView: React.FC<MessagesViewProps> = ({
  viewerRole,
  onBookProvider,
  observerMode = false,
}) => {
  const [searchParams] = useSearchParams();
  const threadIdFromUrl = searchParams.get('thread');
  const navigate = useNavigate();
  const { user } = useAuth();

  // ------------------------------------------
  // RESOLVE THE EFFECTIVE CHAT USER ID
  // ------------------------------------------
  // resolveChatUserId handles:
  //   - null user → null (empty state, no crash)
  //   - demo-* ids → mapped to c-001 / p-001 for demo content
  //   - real ids   → passed through unchanged
  //
  // In observer mode we deliberately pass `null` so no read receipts
  // get flipped and no "personal" filter is applied.
  const viewerUserId = observerMode
    ? null
    : resolveChatUserId(user);

  // ------------------------------------------
  // LIVE THREAD LIST
  // ------------------------------------------
  // The hook:
  //   - reads from localStorage (not demo data)
  //   - subscribes to chat changes (cross-tab live)
  //   - returns [] when there's no user or no threads
  const { threads } = useChatThreads(viewerUserId, { observerMode });

  // ------------------------------------------
  // SELECTED THREAD
  // ------------------------------------------
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select logic, in priority order:
//   1. ?thread=<id> from the URL (set by the Chat button)
//   2. First thread on desktop (default behavior)
//   3. Otherwise: nothing selected
// Also cleans up when the selected thread no longer exists.
useEffect(() => {
  // Priority 1 — URL says which thread to open
  if (
    threadIdFromUrl &&
    threads.some((t) => t.id === threadIdFromUrl) &&
    selectedThreadId !== threadIdFromUrl
  ) {
    setSelectedThreadId(threadIdFromUrl);
    return;
  }

  // Priority 2 — desktop auto-select first
  if (!isMobile && threads.length > 0 && selectedThreadId === null) {
    setSelectedThreadId(threads[0].id);
    return;
  }

  // Cleanup — selected thread no longer exists
  if (selectedThreadId && !threads.some((t) => t.id === selectedThreadId)) {
    setSelectedThreadId(null);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isMobile, threads, threadIdFromUrl]);

  const selectedThread =
    threads.find((t) => t.id === selectedThreadId) || null;

  const showPanelOnMobile = isMobile && selectedThread !== null;

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
  };

  const handleBookProvider = (providerId: string) => {
    if (onBookProvider) onBookProvider(providerId);
    else navigate('/services');
  };

  // ------------------------------------------
  // EMPTY-STATE HINTS
  // ------------------------------------------
  // Small helper so the JSX below stays readable. The hints adapt to
  // who's looking (observer / client / provider) and never assume the
  // user has any data.
  const emptyHint = useMemo(() => {
    if (observerMode) {
      return 'Client/provider conversations will appear here.';
    }
    if (!viewerUserId) {
      return 'Log in to see your conversations.';
    }
    return viewerRole === 'CLIENT'
      ? 'Browse services to find a provider and start chatting.'
      : 'Messages from clients will appear here.';
  }, [observerMode, viewerUserId, viewerRole]);

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <div className={styles.messagesView}>
      {/* Thread list */}
      <aside
        className={`${styles.threadList} ${
          showPanelOnMobile ? styles.threadListHidden : ''
        }`}
      >
        <div className={styles.threadListHeader}>
          <h2>Messages</h2>
          <span className={styles.threadCount}>
            {threads.length} {threads.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>

        {/* Observer banner (support mode) */}
        {observerMode && (
          <div className={styles.observerBanner}>
            <FontAwesomeIcon icon={faEye} />
            <span>Support view — all conversations</span>
          </div>
        )}

        <div className={styles.threadListScroll}>
          {threads.length === 0 ? (
  <div className={styles.emptyList}>
    <FontAwesomeIcon
      icon={faComments}
      className={styles.emptyListIcon}
    />
    <p>No conversations yet.</p>
    <p className={styles.emptyListHint}>{emptyHint}</p>

    {/* Start-a-chat CTA — visible to logged-in clients AND
        providers. Both parties link to the providers list. */}
    {viewerUserId && !observerMode && (
      <button
        type="button"
        className={styles.emptyStartChatBtn}
        onClick={() => navigate('/services')}
      >
        <FontAwesomeIcon icon={faComments} />
        Start a chat
      </button>
    )}
  </div>
) : (
            threads.map((thread) => (
              <ChatThreadListItem
                key={thread.id}
                thread={thread}
                viewerRole={observerMode ? 'CLIENT' : viewerRole}
                isActive={thread.id === selectedThreadId}
                onClick={handleSelectThread}
              />
            ))
          )}
        </div>
      </aside>

      {/* Panel */}
      <div
        className={`${styles.panelWrapper} ${
          showPanelOnMobile ? styles.panelWrapperVisible : ''
        }`}
      >
        <ChatPanel
          thread={selectedThread}
          viewerRole={viewerRole}
          viewerUserId={viewerUserId}
          observerMode={observerMode}
          onBack={isMobile ? handleBackToList : undefined}
          onBookProvider={
            !observerMode && viewerRole === 'CLIENT'
              ? handleBookProvider
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default MessagesView;

