// src/pages/ProviderProfile.tsx

import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../styles/context/ThemeContext';
import { useAuth } from '../account/context/AuthContext';
import { getProviderRatingSummary, getReviewsForProvider } from '../utils/allReviews';
import { getDemoProviderProfile } from '../data/demoProviderProfiles';
import { demoChatThreads } from '../data/demoChat';
import { formatDate, formatRelative } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faStar,
  faCheckCircle,
  faBriefcase,
  faCalendarAlt,
  faComments,
  faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ProviderProfile.module.scss';

// ============================================
// HELPERS
// ============================================

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || 'P';
};

// ============================================
// COMPONENT
// ============================================

export const ProviderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Try to find the provider in demo chat threads for name + fallback rating
  const chatProvider = useMemo(() => {
    for (const thread of demoChatThreads) {
      if (thread.providerId === id) return thread.provider;
    }
    return null;
  }, [id]);

  const profile = id ? getDemoProviderProfile(id) : undefined;

  const reviews = useMemo(() => (id ? getReviewsForProvider(id) : []), [id]);
  const summary = useMemo(
    () => (id ? getProviderRatingSummary(id) : null),
    [id]
  );

  const providerName = chatProvider?.displayName || 'Service Provider';
  const gradient =
    chatProvider?.avatarGradient ||
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

  // Fall back to seeded rating/jobs if no reviews yet
  const displayRating =
    summary && summary.count > 0 ? summary.average : profile?.seedRating ?? null;

  const displayCount =
    summary && summary.count > 0
      ? summary.count
      : 0;

  const completedJobs = profile?.completedJobs ?? chatProvider?.providerCompletedJobs ?? 0;
  const verified = profile?.verified ?? chatProvider?.providerVerified ?? false;
  const categories = profile?.categories ?? chatProvider?.providerCategories ?? [];

  const memberSince = profile?.memberSince;

  // Message thread id — if the current user (client) has a thread with this provider
  const threadWithClient = useMemo(() => {
    if (!user) return null;
    return (
      demoChatThreads.find(
        (t) => t.providerId === id && t.clientId === user.id
      ) ||
      demoChatThreads.find((t) => t.providerId === id && t.clientId === 'c-001') // fallback for demo
    );
  }, [id, user]);

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div className={`${styles.page} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className={styles.container}>
        {/* Back */}
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        {/* Hero */}
        <header className={styles.hero}>
          <div
            className={styles.avatar}
            style={{ background: gradient }}
            aria-hidden="true"
          >
            {getInitials(providerName)}
          </div>

          <div className={styles.heroBody}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{providerName}</h1>
              {verified && (
                <span className={styles.verifiedBadge}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Verified
                </span>
              )}
            </div>

            {categories.length > 0 && (
              <div className={styles.categories}>
                {categories.map((cat) => (
                  <span key={cat} className={styles.categoryTag}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faStar} className={styles.statIconStar} />
                <span className={styles.statValue}>
                  {displayRating !== null
                    ? displayRating.toFixed(1)
                    : 'No rating'}
                </span>
                <span className={styles.statLabel}>
                  {displayCount > 0
                    ? `${displayCount} review${displayCount === 1 ? '' : 's'}`
                    : 'No reviews yet'}
                </span>
              </div>

              <div className={styles.statDivider} />

              <div className={styles.stat}>
                <FontAwesomeIcon icon={faBriefcase} className={styles.statIcon} />
                <span className={styles.statValue}>{completedJobs}</span>
                <span className={styles.statLabel}>
                  {completedJobs === 1 ? 'job' : 'jobs'} completed
                </span>
              </div>

              {memberSince && (
                <>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className={styles.statIcon}
                    />
                    <span className={styles.statValue}>Since</span>
                    <span className={styles.statLabel}>
                      {formatDate(memberSince)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* About */}
        {profile?.about && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>About</h2>
            <p className={styles.about}>{profile.about}</p>
          </section>
        )}

        {/* Message button */}
        {threadWithClient && (
          <button
            type="button"
            className={styles.messageBtn}
            onClick={() => navigate('/client/dashboard')}
          >
            <FontAwesomeIcon icon={faComments} />
            Message {providerName.split(' ')[0]}
          </button>
        )}

        {/* Reviews */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faStar} /> Reviews
            {summary && summary.count > 0 && (
              <span className={styles.reviewCount}>
                {summary.average?.toFixed(1)} · {summary.count}
              </span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div className={styles.noReviews}>
              <span className={styles.noReviewsIcon}>⭐</span>
              <p>No reviews yet.</p>
              <span className={styles.noReviewsHint}>
                Be the first to leave a review after booking with{' '}
                {providerName.split(' ')[0]}.
              </span>
            </div>
          ) : (
            <div className={styles.reviewList}>
              {reviews.map((review) => (
                <article key={review.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FontAwesomeIcon
                          key={n}
                          icon={faStar}
                          className={
                            n <= review.rating
                              ? styles.starOn
                              : styles.starOff
                          }
                        />
                      ))}
                    </span>
                    <strong className={styles.reviewBy}>
                      {review.clientDisplayName}
                    </strong>
                    <span className={styles.reviewTime}>
                      {formatRelative(review.createdAt)}
                    </span>
                  </div>

                  {review.comment && (
                    <p className={styles.reviewComment}>{review.comment}</p>
                  )}

                  {review.tags && review.tags.length > 0 && (
                    <div className={styles.reviewTags}>
                      {review.tags.map((t) => (
                        <span key={t} className={styles.reviewTag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {review.providerReply && (
                    <div className={styles.providerReply}>
                      <strong>Reply from {providerName.split(' ')[0]}</strong>
                      <p>{review.providerReply.text}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Service area (placeholder — no data yet) */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faMapPin} /> Service area
          </h2>
          <p className={styles.about}>
            Serving the wider metro area. Exact coverage confirmed on request.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProviderProfile;
