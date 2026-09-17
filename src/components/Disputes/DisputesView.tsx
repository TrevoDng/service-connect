// src/components/Disputes/DisputesView.tsx

import React, { useMemo, useState } from 'react';
import type { Dispute, DisputeStatus, ViewerRole } from '../../types';
import { DISPUTE_CATEGORY_LABELS } from '../../types';
import {
  getAllDisputes,
  getDisputesInvolvingUser,
} from '../../utils/allDisputes';
import { formatRelative } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faGavel,
  faChevronRight,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { DisputeDetailPanel } from './DisputeDetailPanel';
import { RaiseDisputePicker } from './RaiseDisputePicker';
import styles from './DisputesView.module.scss';

// ============================================
// DEMO USER MAP
// ============================================

const DEMO_USER_IDS: Record<ViewerRole, string> = {
  CLIENT: 'c-001',
  PROVIDER: 'p-001',
  EMPLOYEE: 'e-001',
  ADMIN: 'a-001',
};

// ============================================
// HELPERS
// ============================================

type Tab = 'open' | 'resolved';

const isOpenStatus = (s: DisputeStatus): boolean =>
  s === 'open' || s === 'awaiting_info';

const isStaffRole = (role: ViewerRole): boolean =>
  role === 'EMPLOYEE' || role === 'ADMIN';

// ============================================
// PROPS
// ============================================

export interface DisputesViewProps {
  viewerRole: ViewerRole;
}

// ============================================
// COMPONENT
// ============================================

export const DisputesView: React.FC<DisputesViewProps> = ({ viewerRole }) => {
  const [activeTab, setActiveTab] = useState<Tab>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [showRaisePicker, setShowRaisePicker] = useState(false);

  const viewerUserId = DEMO_USER_IDS[viewerRole];
  const isStaff = isStaffRole(viewerRole);
  const canRaise = !isStaff; // Only CLIENT and PROVIDER raise disputes

  // ------------------------------------------
  // Load disputes (role-aware)
  // ------------------------------------------
  const allDisputes = useMemo(
    () =>
      isStaff
        ? getAllDisputes()
        : getDisputesInvolvingUser(viewerUserId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStaff, viewerUserId, refreshTick]
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
  // Titles
  // ------------------------------------------
  const pageTitle = isStaff ? 'Disputes' : 'Support';
  const pageSubtitle = isStaff
    ? 'Cases escalated by clients or providers.'
    : 'Your cases with ServiceConnect support.';

  // ------------------------------------------
  // Detail view
  // ------------------------------------------
  if (selectedDispute) {
    return (
      <DisputeDetailPanel
  	dispute={selectedDispute}
  	onBack={() => setSelectedId(null)}
  	onChanged={() => setRefreshTick((t) => t + 1)}
  	canResolve={isStaff}
/>
    );
  }

  // ------------------------------------------
  // Raise picker
  // ------------------------------------------
  if (showRaisePicker && canRaise) {
    return (
      <div className={styles.view}>
        <RaiseDisputePicker
          viewerRole={viewerRole as 'CLIENT' | 'PROVIDER'}
          onCancel={() => setShowRaisePicker(false)}
          onCreated={() => {
            setShowRaisePicker(false);
            setRefreshTick((t) => t + 1);
          }}
        />
      </div>
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
          <h2 className={styles.title}>{pageTitle}</h2>
          <p className={styles.subtitle}>{pageSubtitle}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search cases…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {canRaise && (
            <button
              type="button"
              className={styles.newBtn}
              onClick={() => setShowRaisePicker(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              New dispute
            </button>
          )}
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
          <span className={styles.emptyIcon}>
            {activeTab === 'open' ? '🌿' : '📁'}
          </span>
          <h3>
            {activeTab === 'open'
              ? 'No open cases'
              : 'No resolved cases yet'}
          </h3>
          <p>
            {isStaff
              ? activeTab === 'open'
                ? 'Everything is quiet. New disputes will appear here.'
                : 'Closed cases will appear here for reference.'
              : activeTab === 'open'
              ? "Nothing needs your attention right now. If something goes wrong with a job, you can raise a concern here or from any booking card."
              : 'Your resolved cases will appear here.'}
          </p>
          {canRaise && activeTab === 'open' && (
            <button
              type="button"
              className={styles.newBtn}
              onClick={() => setShowRaisePicker(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Raise a dispute
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((dispute) => (
            <DisputeRow
              key={dispute.id}
              dispute={dispute}
              viewerRole={viewerRole}
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
  viewerRole: ViewerRole;
  onClick: () => void;
}

const DisputeRow: React.FC<DisputeRowProps> = ({
  dispute,
  viewerRole,
  onClick,
}) => {
  const open = isOpenStatus(dispute.status);
  const isStaff = isStaffRole(viewerRole);

  // Non-staff viewers see "You" for their own side
  const raisedByLabel =
    !isStaff && dispute.raisedByUserId === (viewerRole === 'CLIENT' ? 'c-001' : 'p-001')
      ? 'You'
      : dispute.raisedByDisplayName;

  const againstLabel =
    !isStaff && dispute.againstUserId === (viewerRole === 'CLIENT' ? 'c-001' : 'p-001')
      ? 'You'
      : dispute.againstDisplayName;

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
          <strong>{raisedByLabel}</strong>
          {' → '}
          <strong>{againstLabel}</strong>
        </p>
      </div>

      <FontAwesomeIcon icon={faChevronRight} className={styles.rowChevron} />
    </button>
  );
};

export default DisputesView;
