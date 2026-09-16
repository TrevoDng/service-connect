// src/components/Disputes/DisputesView.tsx

import React, { useMemo, useState } from 'react';
import type { Dispute, DisputeStatus } from '../../types';
import { DISPUTE_CATEGORY_LABELS } from '../../types';
import { getAllDisputes } from '../../utils/allDisputes';
import { formatRelative } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faGavel,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { DisputeDetailPanel } from './DisputeDetailPanel';
import styles from './DisputesView.module.scss';

// ============================================
// TYPES
// ============================================

type Tab = 'open' | 'resolved';

const isOpenStatus = (s: DisputeStatus): boolean =>
  s === 'open' || s === 'awaiting_info';

// ============================================
// COMPONENT
// ============================================

export const DisputesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const allDisputes = useMemo(
    () => getAllDisputes(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshTick]
  );

  const openDisputes = allDisputes.filter((d) => isOpenStatus(d.status));
  const resolvedDisputes = allDisputes.filter((d) => !isOpenStatus(d.status));

  const filtered = useMemo(() => {
    const list = activeTab === 'open' ? openDisputes : resolvedDisputes;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (d) =>
        d.requestRef.toLowerCase().includes(q) ||
        d.raisedByDisplayName.toLowerCase().includes(q) ||
        d.againstDisplayName.toLowerCase().includes(q) ||
        DISPUTE_CATEGORY_LABELS[d.category].toLowerCase().includes(q)
    );
  }, [activeTab, openDisputes, resolvedDisputes, searchQuery]);

  const selectedDispute = selectedId
    ? allDisputes.find((d) => d.id === selectedId) || null
    : null;

  // ------------------------------------------
  // Detail view
  // ------------------------------------------
  if (selectedDispute) {
    return (
      <DisputeDetailPanel
        dispute={selectedDispute}
        onBack={() => setSelectedId(null)}
        onChanged={() => setRefreshTick((t) => t + 1)}
      />
    );
  }

  // ------------------------------------------
  // List view
  // ------------------------------------------
  return (
    <div className={styles.view}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Disputes</h2>
          <p className={styles.subtitle}>
            Cases escalated by clients or providers.
          </p>
        </div>

        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by ref, name or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'open' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Open
          <span className={styles.tabCount}>{openDisputes.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'resolved' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          Resolved
          <span className={styles.tabCount}>{resolvedDisputes.length}</span>
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>⚖️</span>
          <h3>
            {activeTab === 'open' ? 'No open disputes' : 'No resolved disputes'}
          </h3>
          <p>
            {activeTab === 'open'
              ? 'Everything is quiet. New disputes will appear here.'
              : 'Closed cases will appear here for reference.'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((dispute) => (
            <DisputeRow
              key={dispute.id}
              dispute={dispute}
              onClick={() => setSelectedId(dispute.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ROW
// ============================================

interface DisputeRowProps {
  dispute: Dispute;
  onClick: () => void;
}

const DisputeRow: React.FC<DisputeRowProps> = ({ dispute, onClick }) => {
  const open = isOpenStatus(dispute.status);

  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <div className={styles.rowIcon}>
        <FontAwesomeIcon icon={faGavel} />
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <span className={styles.rowRef}>{dispute.requestRef}</span>
          <span
            className={`${styles.rowStatus} ${
              open ? styles.statusOpen : styles.statusResolved
            }`}
          >
            {open ? 'Open' : 'Resolved'}
          </span>
          <span className={styles.rowAge}>
            {formatRelative(dispute.updatedAt)}
          </span>
        </div>

        <h4 className={styles.rowTitle}>
          {DISPUTE_CATEGORY_LABELS[dispute.category]}
        </h4>

        <p className={styles.rowMeta}>
          <strong>{dispute.raisedByDisplayName}</strong>
          {' → '}
          <strong>{dispute.againstDisplayName}</strong>
        </p>
      </div>

      <FontAwesomeIcon icon={faChevronRight} className={styles.rowChevron} />
    </button>
  );
};

export default DisputesView;
