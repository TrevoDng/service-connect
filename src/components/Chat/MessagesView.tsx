// src/components/Chat/MessagesView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatThread } from '../../types';
import { getThreadsForUser } from '../../data/demoChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { ChatPanel } from './ChatPanel';
import { ChatThreadListItem } from './ChatThreadListItem';
import styles from './MessagesView.module.scss';

// ============================================
// DEMO USER MAPPING
// ============================================
//
// Until the backend is wired, we resolve the "current user id" per role
// against the demo data in `src/data/demoChat.ts`.
//
// When the real auth is ready, replace this with `user.id` from `useAuth()`.

const DEMO_USER_IDS: Record<'CLIENT' | 'PROVIDER', string> = {
  CLIENT: 'c-001',     // John Doe
  PROVIDER: 'p-001',   // Tom Brown
};

export interface MessagesViewProps {
  /** Which side of the chat the current viewer is on */
  viewerRole: 'CLIENT' | 'PROVIDER';
  /** Optional: fired when the client clicks "Book This Provider" */
  onBookProvider?: (providerId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  viewerRole,
  onBookProvider,
}) => {
  const navigate = useNavigate();
  const viewerUserId = DEMO_USER_IDS[viewerRole];

  // ------------------------------------------
  // Load threads for the current viewer
  // ------------------------------------------
  const threads = useMemo<ChatThread[]>(
    () => getThreadsForUser(viewerUserId, viewerRole),
    [viewerUserId, viewerRole]
  );

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Detect mobile once on mount + react to resize
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On desktop, auto-select the first thread. On mobile, start on the list.
  useEffect(() => {
    if (!isMobile && threads.length > 0 && selectedThreadId === null) {
      setSelectedThreadId(threads[0].id);
    }
    // If the user shrinks the window and their selection becomes invalid, reset
    if (
      selectedThreadId &&
      !threads.some((t) => t.id === selectedThreadId)
    ) {
      setSelectedThreadId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, threads]);

  const selectedThread =
    threads.find((t) => t.id === selectedThreadId) || null;

  // On mobile, whether the panel is showing (vs the list)
  const showPanelOnMobile = isMobile && selectedThread !== null;

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
  };

  const handleBookProvider = (providerId: string) => {
    if (onBookProvider) {
      onBookProvider(providerId);
    } else {
      // Fallback: route to the general services page until a
      // provider-specific booking flow exists.
      navigate('/services');
    }
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div className={styles.messagesView}>
      {/* Thread list (hidden on mobile when a thread is open) */}
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

        <div className={styles.threadListScroll}>
          {threads.length === 0 ? (
            <div className={styles.emptyList}>
              <FontAwesomeIcon icon={faComments} className={styles.emptyListIcon} />
              <p>No conversations yet.</p>
              <p className={styles.emptyListHint}>
                {viewerRole === 'CLIENT'
                  ? 'Browse services to find a provider and start chatting.'
                  : 'Messages from clients will appear here.'}
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <ChatThreadListItem
                key={thread.id}
                thread={thread}
                viewerRole={viewerRole}
                isActive={thread.id === selectedThreadId}
                onClick={handleSelectThread}
              />
            ))
          )}
        </div>
      </aside>

      {/* Chat panel (hidden on mobile when no thread is open) */}
      <div
        className={`${styles.panelWrapper} ${
          showPanelOnMobile ? styles.panelWrapperVisible : ''
        }`}
      >
        <ChatPanel
          thread={selectedThread}
          viewerRole={viewerRole}
          viewerUserId={viewerUserId}
          onBack={isMobile ? handleBackToList : undefined}
          onBookProvider={
            viewerRole === 'CLIENT' ? handleBookProvider : undefined
          }
        />
      </div>
    </div>
  );
};

export default MessagesView;
