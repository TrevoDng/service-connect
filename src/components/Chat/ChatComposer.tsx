// src/components/Chat/ChatComposer.tsx

import React, { useRef, useState, useEffect } from 'react';
import type { ChatAttachment } from '../../types';
import { processImageBatch } from '../../utils/imageUpload';
import { generateId } from '../../utils/referenceCode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatComposer.module.scss';

export interface ChatComposerProps {
  onSend: (text: string, attachments?: ChatAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxHeight?: number;
  threadId: string; // <-- Add threadId for folder structuring
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message…',
  maxHeight = 140,
  threadId,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
  }, [text, maxHeight]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const { urls, rejected } = await processImageBatch(files, {
        entityType: 'chats',
        entityId: threadId,
        category: 'attachments',
      });

      if (rejected.length > 0) {
        alert(`Some files failed to upload:\n${rejected.join('\n')}`);
      }

      const newAttachments: ChatAttachment[] = urls.map((url, i) => ({
        id: generateId(),
        url,
        type: 'image',
        name: files[i]?.name || 'Attachment',
      }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload images.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const submit = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || disabled || isUploading) return;
    
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    
    setText('');
    setAttachments([]);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = 'auto';
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled && !isUploading;

  return (
    <div className={styles.composerWrapper}>
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className={styles.attachmentPreviewRow}>
          {attachments.map((att) => (
            <div key={att.id} className={styles.previewTile}>
              <img src={att.url} alt="Preview" />
              <button type="button" onClick={() => removeAttachment(att.id)} className={styles.removePreview}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.composer}>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          title="Attach images"
        >
          <FontAwesomeIcon icon={isUploading ? faSpinner : faPaperclip} spin={isUploading} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isUploading}
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
    </div>
  );
};

export default ChatComposer;