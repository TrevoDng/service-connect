// src/components/Registration/RegistrationRequestsView.tsx

import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faFileAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '../../account/components/common/ConfirmModal'; // <-- Import your modal
import { useSseEvent } from '../../hooks/useSseEvent';
import styles from './RegistrationRequestsView.module.scss';

export const RegistrationRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // State to track which action is pending confirmation
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'decline' | 'resend'; id: string } | null>(null);
  
  // State for a nice inline success banner instead of window.alert
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRegistrationRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchRequests(); 
  }, [refreshTick]);

  useSseEvent('registration:updated', () => setRefreshTick((t) => t + 1));
  useSseEvent('sse:reconnected', () => setRefreshTick((t) => t + 1));

  const handleActionClick = (type: 'approve' | 'decline' | 'resend', id: string) => {
    setConfirmAction({ type, id });
    setSuccessMsg(null);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    
    const { type, id } = confirmAction;
    setConfirmAction(null); // Close the modal immediately
    setActionLoading(id);

    try {
      if (type === 'approve') {
        await adminService.approveRegistrationRequest(id);
        setSuccessMsg('Approved! An email with the registration code has been sent.');
      } else if (type === 'resend') {
        await adminService.resendRegistrationInvite(id);
        setSuccessMsg('A new registration code has been sent to their email.');
      } else {
        await adminService.declineRegistrationRequest(id);
        setSuccessMsg('Application declined.');
      }
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || `Failed to ${type}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading applications...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Registration Applications</h2>
        <p>Review documents and approve applicants.</p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '8px', fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {requests.length === 0 ? (
        <div className={styles.empty}>No pending applications.</div>
      ) : (
        <div className={styles.list}>
          {requests.map((req) => (
            <div key={req.id} className={`${styles.card} ${req.status === 'declined' ? styles.cardDisabled : ''}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{req.firstName} {req.lastName}</h3>
                  <span className={styles.roleBadge}>{req.role}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[req.status]}`}>{req.status}</span>
              </div>

              <div className={styles.details}>
                <p><FontAwesomeIcon icon={faEnvelope} /> {req.email}</p>
                {req.phone && <p>📞 {req.phone}</p>}
              </div>

              <div className={styles.documents}>
                <h4><FontAwesomeIcon icon={faFileAlt} /> Documents</h4>
                <div className={styles.docList}>
                  {req.documents.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className={styles.docBtn}>
                      View File {i + 1}
                    </a>
                  ))}
                </div>
              </div>

              {req.status === 'pending' && (
                <div className={styles.actions}>
                  <button 
                    onClick={() => handleActionClick('decline', req.id)} 
                    disabled={actionLoading === req.id} 
                    className={styles.declineBtn}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Decline
                  </button>
                  <button 
                    onClick={() => handleActionClick('approve', req.id)} 
                    disabled={actionLoading === req.id} 
                    className={styles.approveBtn}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Approve & Send Code
                  </button>
                </div>
              )}

              {/* Resend Code Button */}
              {req.status === 'approved' && (
                <div className={styles.actions}>
                  <button 
                    onClick={() => handleActionClick('resend', req.id)} 
                    disabled={actionLoading === req.id} 
                    className={styles.resendBtn}
                  >
                    <FontAwesomeIcon icon={faEnvelope} /> Resend Registration Code
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* The Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === 'approve' ? 'Approve Application' : 
          confirmAction?.type === 'resend' ? 'Resend Registration Code' : 
          'Decline Application'
        }
        message={
          confirmAction?.type === 'approve'
            ? 'Are you sure you want to approve this application? A registration code will be generated and sent to the applicant via email.'
            : confirmAction?.type === 'resend'
            ? 'This will invalidate the previous code and send a brand new registration code to the applicant.'
            : 'Are you sure you want to decline this application? This action cannot be undone.'
        }
        confirmText={
          confirmAction?.type === 'approve' ? 'Approve & Send Code' : 
          confirmAction?.type === 'resend' ? 'Resend Code' : 
          'Decline'
        }
        confirmVariant={
          confirmAction?.type === 'approve' ? 'primary' : 
          confirmAction?.type === 'resend' ? 'warning' : 
          'danger'
        }
        onConfirm={executeAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};