// src/components/Chat/ChatComposer.tsx

import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatComposer.module.scss';

export interface ChatComposerProps {
  /** Called when the user submits a non-empty message */
  onSend: (text: string) => void;
  /** Disable the composer (e.g. while loading or if the thread is read-only) */
  disabled?: boolean;
  /** Placeholder text override */
  placeholder?: string;
  /** Optional max height (px) before the textarea scrolls internally */
  maxHeight?: number;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message…',
  maxHeight = 140,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize: grow with content, cap at maxHeight
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
  }, [text, maxHeight]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    // Reset height after clearing
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = 'auto';
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter inserts a newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className={styles.composer}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={styles.textarea}
        aria-label="Message"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        className={styles.sendBtn}
        aria-label="Send message"
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  );
};

export default ChatComposer;
