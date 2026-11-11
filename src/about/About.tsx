// src/pages/About.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { getUrl } from '../services/getUrl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandshake,
  faShieldAlt,
  faBolt,
  faUsers,
  faCheckCircle,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import styles from './About.module.scss';

export const About: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/services');
    } else {
      navigate(getUrl('/register')[0]);
    }
  };

  return (
    <div className={styles.aboutPage}>
      <button 
        type="button" 
        className={styles.backBtn} 
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Welcome to ServiceConnect</span>
          <h1 className={styles.title}>
            Connecting you with <span className={styles.highlight}>trusted</span> professionals.
          </h1>
          <p className={styles.subtitle}>
            We bridge the gap between clients who need reliable work done and service providers who take pride in their craft. 
            No more endless searching—just quality connections.
          </p>
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {isAuthenticated ? 'Browse Services' : 'Join the Community'}
          </button>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Why ServiceConnect?</h2>
          <p>We built this platform to solve the biggest headaches in home and professional services.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}><FontAwesomeIcon icon={faShieldAlt} /></div>
            <h3>Verified Trust</h3>
            <p>Every provider goes through a strict document verification process before they can accept a job. Your safety is our priority.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.iconWrapper}><FontAwesomeIcon icon={faBolt} /></div>
            <h3>Real-Time Updates</h3>
            <p>From the moment you request a quote to the final photo of the completed job, everything updates instantly.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.iconWrapper}><FontAwesomeIcon icon={faHandshake} /></div>
            <h3>Fair Negotiation</h3>
            <p>Our built-in price negotiation tool ensures both clients and providers agree on a fair price before work begins.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>How It Works</h2>
          <p>Getting started is easy, whether you're hiring or offering services.</p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h4>Create an Account</h4>
            <p>Sign up as a Client or apply as a Service Provider. Providers just need to submit their ID and certificates.</p>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h4>Connect & Chat</h4>
            <p>Browse services, review profiles, and use our real-time chat to ask questions before committing.</p>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h4>Get it Done</h4>
            <p>Agree on a price, track the work session live, and release payment only when you're 100% satisfied.</p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <FontAwesomeIcon icon={faUsers} className={styles.statIcon} />
            <h4>Growing Community</h4>
            <p>Connecting hundreds of locals</p>
          </div>
          <div className={styles.statItem}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.statIcon} />
            <h4>Verified Experts</h4>
            <p>Only the best make the cut</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;