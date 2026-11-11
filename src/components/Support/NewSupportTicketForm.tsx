// src/components/Support/NewSupportTicketForm.tsx
import React, { useState } from 'react';
import type { SupportTicket, ChatAttachment } from '../../types';
import { processImageBatch } from '../../utils/imageUpload';
import { generateId } from '../../utils/referenceCode';
import { supportService } from '../../services/support.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperclip,
  faSpinner,
  faTimes,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';
import styles from './NewSupportTicketForm.module.scss';

export interface NewSupportTicketFormProps {
  onCancel: () => void;
  onCreated: (ticket: SupportTicket) => void;
}

export const NewSupportTicketForm: React.FC<NewSupportTicketFormProps> = ({
  onCancel,
  onCreated,
}) => {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Single temp ID for this form mount — used as the upload folder.
  // Matches RequestRegistration.tsx's pattern. Never becomes a real ticket ID;
  // that's fine — the URL is what we store on the message.
  const [tempId] = useState<string>(() => crypto.randomUUID());

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const { urls, rejected } = await processImageBatch(files, {
        entityType: 'support',
        entityId: tempId,
        category: 'attachments',
      });
      if (rejected.length > 0) {
        alert(`Some files failed:\n${rejected.join('\n')}`);
      }
      const newAtts: ChatAttachment[] = urls.map((url, i) => ({
        id: generateId(),
        url,
        type: 'image',
        name: files[i]?.name || 'Attachment',
      }));
      setAttachments((prev) => [...prev, ...newAtts]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload images.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const canSubmit =
    !submitting &&
    !isUploading &&
    (text.trim().length > 0 || attachments.length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const { ticket } = await supportService.createTicket({
        subject: subject.trim() || undefined,
        text: text.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      onCreated(ticket);
    } catch (err: any) {
      setError(err?.message || 'Failed to create support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerAvatar}>
          <FontAwesomeIcon icon={faHeadset} />
        </div>
        <div>
          <h2>New support ticket</h2>
          <p>Describe your issue and our team will reply as soon as possible.</p>
        </div>
      </div>

      <div className={styles.body}>
        <label className={styles.field}>
          <span className={styles.label}>Subject (optional)</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            placeholder="e.g. Payment not reflected"
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Message</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Explain what's happening and what you need help with…"
            className={styles.textarea}
            rows={6}
          />
        </label>

        {attachments.length > 0 && (
          <div className={styles.attachmentRow}>
            {attachments.map((att) => (
              <div key={att.id} className={styles.previewTile}>
                <img src={att.url} alt="Preview" />
                <button
                  type="button"
                  className={styles.removePreview}
                  onClick={() => removeAttachment(att.id)}
                  aria-label="Remove attachment"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.footer}>
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
          disabled={isUploading || submitting}
        >
          <FontAwesomeIcon
            icon={isUploading ? faSpinner : faPaperclip}
            spin={isUploading}
          />
          {isUploading ? 'Uploading…' : 'Attach images'}
        </button>

        <div className={styles.spacer} />

        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? 'Creating…' : 'Create ticket'}
        </button>
      </div>
    </div>
  );
};

export default NewSupportTicketForm;