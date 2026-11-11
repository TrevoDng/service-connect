// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import { serviceService } from '../services/service.service';
import type { Service } from '../types/service.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getServiceIcon } from '../utils/serviceIcons';
import { faArrowRight, faStar, faBolt, faShieldHalved, faMessage, faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from './Home.module.scss';

interface HomeProps { currentPage: string; setCurrentPage: (p: string) => void; }

const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([serviceService.getServices(), serviceService.getCategories()]);
        setServices(s); setFilteredServices(s); setCategories(['All', ...c]);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    let f = services;
    if (selectedCategory !== 'All') f = f.filter((s) => s.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q));
    }
    setFilteredServices(f);
  }, [searchQuery, selectedCategory, services]);

  const go = (path: string) => { navigate(getUrl(path, '')[0]); setCurrentPage(getUrl(path, '')[0]); };

  return (
    <div className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.gridBg} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.tag}><span className={styles.dot} /> Live in South Africa</span>
          <h1 className={styles.h1}>
            Home services, <span className={styles.blue}>engineered</span> around you.
          </h1>
          <p className={styles.subhead}>
            Compare, chat, and book vetted professionals — with transparent quotes
            and real-time updates at every step.
          </p>

          <div className={styles.heroCta}>
            <button className={styles.heroPrimaryBtn} onClick={() => go('/services')}>
              Find a pro
              <FontAwesomeIcon icon={faArrowRight} className={styles.heroPrimaryArrow} />
            </button>
            <span className={styles.heroCtaMeta}>
              <span className={styles.heroDot} />
              Free to browse — no sign-up required
            </span>
          </div>

          <div className={styles.stats}>
            <div><strong>1.2k+</strong><span>vetted pros</span></div>
            <div><strong>4.8★</strong><span>avg. rating</span></div>
            <div><strong>R0</strong><span>to chat</span></div>
          </div>
        </div>

        {/* Blueprint illustration */}
        <div className={styles.blueprint} aria-hidden="true">
          <svg viewBox="0 0 500 500">
            <defs>
              <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0 L0 0 0 20" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="500" height="500" fill="url(#bp-grid)" />
            <rect x="40" y="40" width="420" height="420" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 6" />
            {/* Corner marks */}
            <path d="M40 70 L40 40 L70 40" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M460 70 L460 40 L430 40" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M40 430 L40 460 L70 460" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M460 430 L460 460 L430 460" stroke="#60a5fa" strokeWidth="3" fill="none" />

            {/* Hammer (main) */}
            <g transform="translate(160 140)" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" fill="none">
              <line x1="20" y1="200" x2="100" y2="30" />
              <line x1="80" y1="20" x2="180" y2="60" strokeWidth="18" />
              <line x1="80" y1="20" x2="180" y2="60" strokeWidth="4" stroke="#0f172a" />
            </g>

            {/* Wrench (top right) */}
            <g transform="translate(370 110) rotate(-30)" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <line x1="0" y1="120" x2="0" y2="30" />
              <path d="M-14 30 a14 14 0 1 0 28 0" />
            </g>

            {/* Screwdriver (bottom left) */}
            <g transform="translate(100 340) rotate(20)" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <rect x="-8" y="0" width="16" height="40" rx="3" fill="#1e40af" opacity="0.4" />
              <line x1="0" y1="40" x2="0" y2="90" />
              <line x1="-4" y1="90" x2="4" y2="90" strokeWidth="4" />
            </g>

            {/* Dimension annotation */}
            <g stroke="#f59e0b" strokeWidth="1" fill="none">
              <line x1="60" y1="410" x2="440" y2="410" />
              <line x1="60" y1="400" x2="60" y2="420" />
              <line x1="440" y1="400" x2="440" y2="420" />
            </g>
            <text x="250" y="435" textAnchor="middle" fill="#f59e0b" fontSize="11" fontFamily="ui-monospace, monospace">400mm</text>
            <text x="60" y="90" fill="#f59e0b" fontSize="10" fontFamily="ui-monospace, monospace">REV. 04</text>
          </svg>
        </div>
      </header>

      {/* SERVICES */}
      <section className={styles.servicesSection}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionTag}>/ services</span>
            <h2 className={styles.sectionTitle}>Pick a trade. Get matched.</h2>
          </div>
          <p className={styles.sectionSub}>All providers vetted. All quotes in writing.</p>
        </div>

        <div className={styles.servicesToolbar}>
          <div className={styles.toolbarInputWrap}>
            <FontAwesomeIcon icon={faSearch} className={styles.toolbarSearchIcon} />
            <input
              type="text"
              placeholder="Search a service, a trade, or a problem…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.toolbarInput}
              aria-label="Search services"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.toolbarSelect}
            aria-label="Filter by category"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="button" className={styles.toolbarBtn} onClick={() => go('/services')}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /><p>Loading…</p></div>
        ) : filteredServices.length === 0 ? (
          <div className={styles.noResults}>No matches. Try another term.</div>
        ) : (
          <div className={styles.servicesGrid}>
            {filteredServices.map((s, i) => (
              <div
                key={s.id}
                className={styles.serviceCard}
                onClick={() => go(`/services/${s.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && go(`/services/${s.id}`)}
              >
                <div className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.cardIcon}><FontAwesomeIcon icon={getServiceIcon(s.title)} /></div>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardDesc}>{s.description}</p>
                <div className={styles.cardFoot}>
                  {s.rating && <span className={styles.rating}><FontAwesomeIcon icon={faStar} /> {s.rating.toFixed(1)}</span>}
                  <span className={styles.view}><FontAwesomeIcon icon={faArrowRight} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CHAT */}
      <section className={styles.chatSection}>
        <div className={styles.chatInner}>
          <div className={styles.chatCopy}>
            <span className={styles.sectionTag}>/ chat-first</span>
            <h2 className={styles.chatTitle}>Real conversations. No phone tag.</h2>
            <p className={styles.chatSub}>
              Message providers before you book. Share photos, compare quotes, keep
              your details private until you're ready.
            </p>
            <div className={styles.pillars}>
              <div className={styles.pillar}>
                <FontAwesomeIcon icon={faMessage} className={styles.pillarIcon} />
                <div><strong>Message first</strong><span>Compare up to 5 pros side by side.</span></div>
              </div>
              <div className={styles.pillar}>
                <FontAwesomeIcon icon={faBolt} className={styles.pillarIcon} />
                <div><strong>Real-time replies</strong><span>Live updates the moment they respond.</span></div>
              </div>
              <div className={styles.pillar}>
                <FontAwesomeIcon icon={faShieldHalved} className={styles.pillarIcon} />
                <div><strong>Private by default</strong><span>Address shared only when you choose.</span></div>
              </div>
            </div>
          </div>

          <div className={styles.chatMock}>
            <div className={styles.mockCard}>
              <div className={styles.mockHeader}>
                <div className={styles.mockAvatar}>TB</div>
                <div className={styles.mockHeaderText}>
                  <strong>Thabo Brown</strong>
                  <span>⭐ 4.8 · 46 jobs</span>
                </div>
                <span className={styles.mockStatus}>online</span>
              </div>
              <div className={styles.mockBody}>
                <div className={styles.mockBubbleLeft}>My sink is leaking — can you help this week?</div>
                <div className={styles.mockBubbleRight}>Yes. Worn seal likely — R350, confirmed on-site.</div>
                <div className={styles.mockBubbleLeft}>Perfect. Can you come Thursday AM?</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className={styles.finalCta}>
        <div className={styles.finalInner}>
          <h2 className={styles.finalTitle}>Ready when you are.</h2>
          <p className={styles.finalSub}>No commitments. No sign-up fees. Just pros you can trust.</p>
          <button className={styles.primaryCta} onClick={() => go('/services')}>
            Find a pro <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;