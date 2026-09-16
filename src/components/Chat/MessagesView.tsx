// src/components/Chat/MessagesView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatThread } from '../../types';
import { getThreadsForUser, getAllThreads } from '../../data/demoChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faEye } from '@fortawesome/free-solid-svg-icons';
import { ChatPanel } from './ChatPanel';
import { ChatThreadListItem } from './ChatThreadListItem';
import styles from './MessagesView.module.scss';

// ============================================
// DEMO USER MAPPING
// ============================================

const DEMO_USER_IDS: Record<'CLIENT' | 'PROVIDER', string> = {
  CLIENT: 'c-001',
  PROVIDER: 'p-001',
};

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
  const navigate = useNavigate();

  // In observer mode we always show all threads; otherwise filter by user
  const viewerUserId = DEMO_USER_IDS[viewerRole];

  const threads = useMemo<ChatThread[]>(
    () =>
      observerMode
        ? getAllThreads()
        : getThreadsForUser(viewerUserId, viewerRole),
    [viewerUserId, viewerRole, observerMode]
  );

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

  // Auto-select first thread on desktop
  useEffect(() => {
    if (!isMobile && threads.length > 0 && selectedThreadId === null) {
      setSelectedThreadId(threads[0].id);
    }
    if (selectedThreadId && !threads.some((t) => t.id === selectedThreadId)) {
      setSelectedThreadId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, threads]);

  const selectedThread =
    threads.find((t) => t.id === selectedThreadId) || null;

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
    if (onBookProvider) onBookProvider(providerId);
    else navigate('/services');
  };

  // ------------------------------------------
  // Render
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
              <p className={styles.emptyListHint}>
                {observerMode
                  ? 'Client/provider conversations will appear here.'
                  : viewerRole === 'CLIENT'
                  ? 'Browse services to find a provider and start chatting.'
                  : 'Messages from clients will appear here.'}
              </p>
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
          viewerUserId={observerMode ? 'observer' : viewerUserId}
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
