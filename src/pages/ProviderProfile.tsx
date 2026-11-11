// src/pages/ProviderProfile.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../styles/context/ThemeContext';
import { formatRelative, formatDate } from '../utils/formatters';
import { useStartChat } from '../hooks/useStartChat';
import { providerService, type PublicProviderProfile } from '../services/provider.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faStar,
  faCheckCircle,
  faBriefcase,
  faComments,
  faMapPin,
  faEnvelope,
  faPhone,
  faBuilding,
  faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ProviderProfile.module.scss';
import type { ProviderRatingSummary, Review } from '../types';
import { reviewService } from '../services/review.service';
import { useSseEvent } from '../hooks/useSseEvent';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || 'P';
};

export const ProviderProfile: React.FC = () => {
  const { startChat, canStartChat } = useStartChat();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<PublicProviderProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ProviderRatingSummary | null>(null);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // Fetch Provider Details
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await providerService.getPublicProfile(id);
        if (!cancelled) {
          setProfile(data);
          setLoadingProfile(false);
        }
      } catch (err) {
        console.warn('[provider-profile] profile fetch failed', err);
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch Reviews
  useEffect(() => {
    if (!id) {
      setReviewsLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { reviews: list, summary: sum } = await reviewService.getReviewsForProvider(id);
        if (!cancelled) {
          setReviews(list);
          setSummary(sum);
          setReviewsLoaded(true);
        }
      } catch (err) {
        console.warn('[provider-profile] reviews fetch failed', err);
        if (!cancelled) setReviewsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);


  // inside the component, next to the existing fetches:
  useSseEvent('review:updated', () => {
    // re-fetch reviews
    if (!id) return;
    reviewService.getReviewsForProvider(id).then(({ reviews: list, summary: sum }) => {
      setReviews(list);
      setSummary(sum);
    }).catch(() => {});
  });

  if (loadingProfile) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  if (!profile) return <div style={{ padding: '2rem', textAlign: 'center' }}>Provider not found.</div>;

  // Derived Data
  const displayName = profile.companyName || `${profile.firstName} ${profile.lastName}`;
  const gradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  const verified = profile.status === 'active';
  const categories = profile.serviceType ? [profile.serviceType] : [];

  const displayRating = summary && summary.count > 0 ? summary.average : null;
  const displayCount = summary && summary.count > 0 ? summary.count : 0;

  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <header className={styles.hero}>
          <div className={styles.avatar} style={{ background: gradient }} aria-hidden="true">
            {getInitials(displayName)}
          </div>

          <div className={styles.heroBody}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{displayName}</h1>
              {verified && (
                <span className={styles.verifiedBadge}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Verified
                </span>
              )}
            </div>

            {categories.length > 0 && (
              <div className={styles.categories}>
                {categories.map((cat) => (
                  <span key={cat} className={styles.categoryTag}>{cat}</span>
                ))}
              </div>
            )}

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faStar} className={styles.statIconStar} />
                <span className={styles.statValue}>{displayRating !== null ? displayRating.toFixed(1) : 'No rating'}</span>
                <span className={styles.statLabel}>{displayCount > 0 ? `${displayCount} review${displayCount === 1 ? '' : 's'}` : 'No reviews yet'}</span>
              </div>

              <div className={styles.statDivider} />

              <div className={styles.stat}>
                <FontAwesomeIcon icon={faBriefcase} className={styles.statIcon} />
                <span className={styles.statValue}>Since</span>
                <span className={styles.statLabel}>{formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* CHAT BUTTON */}
        {canStartChat && id && (
          <button
            type="button"
            className={styles.messageBtn}
            onClick={() => startChat({
              providerId: id,
              providerDisplayName: displayName,
              providerAvatarGradient: gradient,
              providerRating: displayRating ?? undefined,
              providerCategories: categories,
              providerVerified: verified,
            })}
          >
            <FontAwesomeIcon icon={faComments} /> Chat with {displayName.split(' ')[0]}
          </button>
        )}

        {/* CONTACT & DETAILS */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Contact & Details</h2>
          
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <FontAwesomeIcon icon={faEnvelope} />
              {/* 👇 Add className={styles.contactText} */}
              <span className={styles.contactText}>{profile.email}</span>
            </div>
            
            {profile.phone && (
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faPhone} />
                <span className={styles.contactText}>{profile.phone}</span>
              </div>
            )}
            
            {profile.companyName && (
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faBuilding} />
                <span className={styles.contactText}>{profile.companyName}</span>
              </div>
            )}
            
            {profile.registrationNumber && (
              <div className={styles.contactItem}>
                <FontAwesomeIcon icon={faIdCard} />
                <span className={styles.contactText}>Reg: {profile.registrationNumber}</span>
              </div>
            )}
          </div>
        </section>

        {/* REVIEWS */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faStar} /> Reviews
            {summary && summary.count > 0 && (
              <span className={styles.reviewCount}>{summary.average?.toFixed(1)} · {summary.count}</span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div className={styles.noReviews}>
              <span className={styles.noReviewsIcon}>⭐</span>
              <p>No reviews yet.</p>
            </div>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map((review) => (
                <article key={review.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FontAwesomeIcon key={n} icon={faStar} className={n <= review.rating ? styles.starOn : styles.starOff} />
                      ))}
                    </span>
                    <strong className={styles.reviewBy}>{review.clientDisplayName}</strong>
                    <span className={styles.reviewTime}>{formatRelative(review.createdAt)}</span>
                  </div>

                  {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}

                  {review.providerReply && (
                    <div className={styles.providerReply}>
                      <strong>Reply from Provider</strong>
                      <p>{review.providerReply.text}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}><FontAwesomeIcon icon={faMapPin} /> Service area</h2>
          <p className={styles.about}>Serving the wider metro area. Exact coverage confirmed on request.</p>
        </section>
      </div>
    </div>
  );
};

export default ProviderProfile;