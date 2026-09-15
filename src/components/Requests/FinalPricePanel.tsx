// src/components/Requests/FinalPricePanel.tsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import styles from './FinalPricePanel.module.scss';

export interface FinalPricePanelProps {
  /** 'propose' = provider sets first price
   *  'counter' = client counters provider's price */
  mode: 'propose' | 'counter';
  /** If counter, the amount we're countering against (for context) */
  currentPrice?: number;
  /** Starting value for the input */
  initialAmount?: number;
  /** Optional label override */
  title?: string;
  onSave: (amount: number, note: string) => void;
  onCancel: () => void;
}

export const FinalPricePanel: React.FC<FinalPricePanelProps> = ({
  mode,
  currentPrice,
  initialAmount,
  title,
  onSave,
  onCancel,
}) => {
  const [amount, setAmount] = useState(
    initialAmount !== undefined ? String(initialAmount) : ''
  );
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const heading =
    title ??
    (mode === 'propose'
      ? 'Propose a final price'
      : 'Counter the proposed price');

  const handleSave = () => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    onSave(parsed, note.trim());
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faDollarSign} className={styles.headerIcon} />
        <h4 className={styles.title}>{heading}</h4>
      </div>

      {mode === 'counter' && currentPrice !== undefined && (
        <p className={styles.context}>
          The provider proposed{' '}
          <strong>R{currentPrice.toLocaleString()}</strong>. Enter your counter.
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="fp-amount" className={styles.label}>
          Amount (ZAR)
        </label>
        <div className={styles.priceRow}>
          <span className={styles.pricePrefix}>R</span>
          <input
            id="fp-amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1200"
            className={styles.input}
            autoFocus
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="fp-note" className={styles.label}>
          {mode === 'propose' ? 'Optional note' : 'Why this amount?'}
        </label>
        <textarea
          id="fp-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={
            mode === 'propose'
              ? 'Includes materials, labour, and a 1-year guarantee.'
              : 'Similar jobs in the area are typically closer to…'
          }
          className={styles.textarea}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          <FontAwesomeIcon icon={faTimes} />
          Cancel
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          <FontAwesomeIcon icon={faCheck} />
          {mode === 'propose' ? 'Send final price' : 'Send counter'}
        </button>
      </div>
    </div>
  );
};

export default FinalPricePanel;
