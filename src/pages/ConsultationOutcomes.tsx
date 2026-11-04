// src/pages/ConsultationOutcomes.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { useTheme } from '../styles/context/ThemeContext';
import { canSeeConsultationFeeStatus, type ViewerRole, type Booking } from '../types';
import { bookingService } from '../services/booking.service';
import {
  formatDate, formatDateTime, formatPrice, formatRelative, formatTime,
} from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faFileInvoiceDollar, faCheckCircle, faTimesCircle, faClock,
  faHandshake, faGavel, faUser, faUserTie, faCamera, faClipboardList,
  faMapMarkedAlt, faKey, faPlay, faDollarSign, faLock,
} from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '../account/components/common/ConfirmModal';
import styles from './ConsultationOutcomes.module.scss';

const getViewerRole = (role?: string): ViewerRole => {
  if (role === 'PROVIDER' || role === 'EMPLOYEE' || role === 'ADMIN') return role;
  return 'CLIENT';
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'requested': return 'Awaiting provider';
    case 'accepted': return 'Accepted';
    case 'consultation_paid': return 'Consultation paid';
    case 'evaluated': return 'Site evaluated';
    case 'price_proposed': return 'Price proposed';
    case 'price_agreed': return 'Price agreed';
    case 'in_progress': return 'Work in progress';
    case 'completed': return 'Completed';
    case 'declined': return 'Declined';
    case 'cancelled': return 'Cancelled';
    case 'price_disputed': return 'Price disputed';
    default: return status;
  }
};

const statusTone = (status: string): 'success' | 'info' | 'warning' | 'danger' | 'muted' => {
  switch (status) {
    case 'completed': case 'price_agreed': return 'success';
    case 'accepted': case 'consultation_paid': case 'evaluated': case 'price_proposed': case 'in_progress': return 'info';
    case 'requested': return 'warning';
    case 'declined': case 'price_disputed': return 'danger';
    default: return 'muted';
  }
};

const stageLabel = (stage: string): string => {
  switch (stage) {
    case 'suggested': return 'Client suggested';
    case 'consultation': return 'Consultation fee paid';
    case 'final_proposed': return 'Final price proposed';
    case 'final_agreed': return 'Final price agreed';
    default: return stage;
  }
};

export const ConsultationOutcomes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const viewerRole = getViewerRole(user?.role);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(true);
  const [showLaterModal, setShowLaterModal] = useState(false);

  // Negotiation State
  const [showCounterForm, setShowCounterForm] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      const data = viewerRole === 'CLIENT' 
        ? await bookingService.getClientBookingById(id)
        : await bookingService.getProviderBookingById(id);
      setBooking(data || null);
    } catch (err) {
      console.warn('[outcomes] fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, viewerRole]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    if (!booking) { navigate('/'); return; }
    if (booking.status === 'requested') {
      if (viewerRole === 'CLIENT') navigate('/client/dashboard');
      else if (viewerRole === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/');
    }
  }, [booking, user, loading, viewerRole, navigate]);

  // ============================================
  // ACTIONS
  // ============================================
  
  const handleProposePrice = async () => {
    if (!booking || !amount) return;
    const num = Number(amount);
    if (num <= 0) return alert('Please enter a valid amount.');

    setIsSubmitting(true);
    try {
      await bookingService.proposePrice(booking.id, num, note);
      await fetchBooking();
      setShowCounterForm(false);
    } catch (err) {
      alert('Failed to propose price.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptCounter = async () => {
    if (!booking) return;
    if (!window.confirm(`Accept the client's counter of ${formatPrice(booking.finalPrice || 0)}?`)) return;
    
    setIsSubmitting(true);
    try {
      await bookingService.acceptCounter(booking.id);
      await fetchBooking();
    } catch (err) {
      alert('Failed to accept counter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHoldFirm = async () => {
    if (!booking) return;
    if (!window.confirm('Are you sure you want to hold firm on your original price? The client will have to accept or dispute.')) return;
    
    setIsSubmitting(true);
    try {
      await bookingService.providerHoldFirm(booking.id);
      await fetchBooking();
    } catch (err) {
      alert('Failed to hold firm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (viewerRole === 'CLIENT') navigate('/client/dashboard?tab=consultations');
    else if (viewerRole === 'PROVIDER') navigate('/provider/dashboard?tab=consultations&subtab=completed');
    else navigate(-1);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading outcomes…</div>;
  if (!booking) return null;

  const tone = statusTone(booking.status);
  const showFeeBadge = canSeeConsultationFeeStatus(viewerRole);
  const feePaid = !!booking.consultationPaidAt;
  const hasConsultationPhotos = booking.consultationPhotos && booking.consultationPhotos.length > 0;

  // Logic to determine what the Provider sees at the top
  const isProvider = viewerRole === 'PROVIDER';
  const isEvaluated = booking.status === 'evaluated';
  const isClientCounter = booking.status === 'price_proposed' && booking.pendingCounterParty === 'PROVIDER' && !booking.holdFirm;
  const isProviderHolding = booking.status === 'price_proposed' && booking.pendingCounterParty === 'CLIENT' && booking.holdFirm;

  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <header className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.ref}>{booking.requestRef}</span>
            <span className={`${styles.statusBadge} ${styles[tone]}`}>
              {statusLabel(booking.status)}
            </span>
          </div>
          <h1 className={styles.title}>{booking.serviceTitle}</h1>
          <p className={styles.category}>{booking.serviceCategory}</p>
          <p className={styles.updated}>Last update {formatRelative(booking.updatedAt)}</p>
        </header>

        {/* ============================================ */}
        {/* PROVIDER NEGOTIATION SECTION */}
        {/* ============================================ */}
        {isProvider && (
          <>
            {/* 1. Initial Proposal Form */}
            {isEvaluated && showProposalForm && (
              <section className={styles.proposeSection}>
                <div className={styles.proposeHeader}>
                  <h2><FontAwesomeIcon icon={faDollarSign} /> Send Final Price Proposal</h2>
                  <button type="button" className={styles.laterBtn} onClick={() => { setShowProposalForm(false); setShowLaterModal(true); }}>
                    Do this later
                  </button>
                </div>
                <p className={styles.proposeHint}>Review your findings below, then send your final price to {booking.clientDisplayName}.</p>
                <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Client's initial suggested price:</span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{formatPrice(booking.suggestedPrice)}</strong>
                </div>
                <div className={styles.proposeForm}>
                  <div className={styles.inputGroup}>
                    <label>Amount (ZAR)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1500" className={styles.input} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Note (optional)</label>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Includes materials and labor" className={styles.input} />
                  </div>
                  <button type="button" className={styles.proposeBtn} onClick={handleProposePrice} disabled={isSubmitting || !amount}>
                    {isSubmitting ? 'Sending...' : 'Send Proposal'}
                  </button>
                </div>
              </section>
            )}

            {/* 2. Client has Countered (Provider's Turn to Respond) */}
            {isClientCounter && (
              <section className={styles.proposeSection}>
                <div className={styles.proposeHeader}>
                  <h2><FontAwesomeIcon icon={faHandshake} /> Client Countered</h2>
                </div>
                <p className={styles.proposeHint}>
                  {booking.clientDisplayName} has proposed a new price. Choose how you want to proceed.
                </p>
                
                <div style={{ padding: '16px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Client Counter Offer:</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: '4px 0' }}>
                    {formatPrice(booking.finalPrice || 0)}
                  </div>
                </div>

                {!showCounterForm ? (
                  <div className={styles.actionRow}>
                    <button 
                      type="button" 
                      className={`${styles.negotiationBtn} ${styles.acceptBtn}`} 
                      onClick={handleAcceptCounter} 
                      disabled={isSubmitting}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} /> Accept {formatPrice(booking.finalPrice || 0)}
                    </button>
                    <button 
                      type="button" 
                      className={`${styles.negotiationBtn} ${styles.counterBtn}`} 
                      onClick={() => setShowCounterForm(true)}
                    >
                      Propose New Price
                    </button>
                    <button 
                      type="button" 
                      className={`${styles.negotiationBtn} ${styles.holdFirmBtn}`} 
                      onClick={handleHoldFirm} 
                      disabled={isSubmitting}
                    >
                      <FontAwesomeIcon icon={faLock} /> Hold Firm
                    </button>
                  </div>
                ) : (
                  /* ... the counter form inputs ... */
                  <div className={styles.proposeForm}>
                    <div className={styles.inputGroup}>
                      <label>Your New Price (ZAR)</label>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 2500" className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Note (optional)</label>
                      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for counter" className={styles.input} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className={styles.cancelBtn} onClick={() => setShowCounterForm(false)}>Cancel</button>
                      <button type="button" className={styles.proposeBtn} onClick={handleProposePrice} disabled={isSubmitting || !amount}>
                        Send Counter
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 3. Provider is Holding Firm (Waiting on Client) */}
            {isProviderHolding && (
              <section className={styles.proposeSection} style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <div className={styles.proposeHeader}>
                  <h2 style={{ color: '#dc2626' }}><FontAwesomeIcon icon={faLock} /> You are holding firm</h2>
                </div>
                <p className={styles.proposeHint}>
                  You are holding firm on <strong>{formatPrice(booking.finalPrice || 0)}</strong>. The client must now accept or dispute.
                </p>
              </section>
            )}
          </>
        )}

        {/* Parties */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Parties</h2>
          <div className={styles.partyGrid}>
            <div className={styles.partyCard}>
              <span className={styles.partyIcon}><FontAwesomeIcon icon={faUser} /></span>
              <div><div className={styles.partyRole}>Client</div><div className={styles.partyName}>{booking.clientDisplayName}</div></div>
            </div>
            <div className={styles.partyCard}>
              <span className={styles.partyIcon}><FontAwesomeIcon icon={faUserTie} /></span>
              <div><div className={styles.partyRole}>Service Provider</div><div className={styles.partyName}>{booking.providerDisplayName}</div></div>
            </div>
          </div>
        </section>

        {/* Price timeline */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><FontAwesomeIcon icon={faFileInvoiceDollar} /> Price timeline</h2>
          <div className={styles.timeline}>
            {booking.priceHistory?.map((entry, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles[`dot_${entry.stage}`]}`}>
                  {entry.stage === 'final_agreed' ? <FontAwesomeIcon icon={faHandshake} /> : <span>{i + 1}</span>}
                </div>
                <div className={styles.timelineBody}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineStage}>{stageLabel(entry.stage)}</span>
                    <span className={styles.timelineAmount}>{formatPrice(entry.amount)}</span>
                  </div>
                  <div className={styles.timelineMeta}>
                    <span>{formatDateTime(entry.at)}</span>
                    {entry.note && <span>· {entry.note}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consultation findings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><FontAwesomeIcon icon={faMapMarkedAlt} /> Site consultation</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}><span className={styles.summaryLabel}>Fee</span><span className={styles.summaryValue}>{booking.consultationFee > 0 ? formatPrice(booking.consultationFee) : '—'}</span></div>
            <div className={styles.summaryItem}><span className={styles.summaryLabel}>Fee paid</span><span className={styles.summaryValue}>{booking.consultationPaidAt ? formatDate(booking.consultationPaidAt) : '—'}</span></div>
            <div className={styles.summaryItem}><span className={styles.summaryLabel}>Site visited</span><span className={styles.summaryValue}>{booking.siteVisited ? 'Yes' : 'Not yet'}</span></div>
            {booking.consultationClockIn && (<div className={styles.summaryItem}><span className={styles.summaryLabel}>Clocked in</span><span className={styles.summaryValue}>{formatTime(booking.consultationClockIn)}</span></div>)}
            {booking.consultationClockOut && (<div className={styles.summaryItem}><span className={styles.summaryLabel}>Clocked out</span><span className={styles.summaryValue}>{formatTime(booking.consultationClockOut)}</span></div>)}
          </div>

          {booking.consultationNotes && (
            <div className={styles.notesBlock}><h3 className={styles.notesTitle}><FontAwesomeIcon icon={faClipboardList} /> Findings</h3><p className={styles.notes}>{booking.consultationNotes}</p></div>
          )}

          {hasConsultationPhotos && (
            <div className={styles.photosBlock}>
              <h3 className={styles.notesTitle}><FontAwesomeIcon icon={faCamera} /> Site photos</h3>
              <div className={styles.photoGrid}>
                {booking.consultationPhotos!.map((url, i) => (<figure key={i} className={styles.photoTile}><img src={url} alt={`Site photo ${i + 1}`} loading="lazy" /></figure>))}
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={showLaterModal}
        title="Propose Price Later"
        message="You have chosen to send the final price proposal later."
        confirmText="Go to Consultations"
        cancelText="Stay on this page"
        confirmVariant="primary"
        onConfirm={() => { setShowLaterModal(false); navigate('/provider/dashboard?tab=consultations&subtab=completed'); }}
        onCancel={() => setShowLaterModal(false)}
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          When you are ready, go to <strong>Consultations &gt; Completed</strong> and open the item with reference: <strong>{booking.requestRef}</strong>.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ConsultationOutcomes;