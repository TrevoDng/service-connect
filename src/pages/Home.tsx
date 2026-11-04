// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import { serviceService } from '../services/service.service';
import type { Service } from '../types/service.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getServiceIcon } from '../utils/serviceIcons';
import styles from './Home.module.scss';

interface HomeProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedServices, fetchedCategories] = await Promise.all([
          serviceService.getServices(),
          serviceService.getCategories()
        ]);
        setServices(fetchedServices);
        setFilteredServices(fetchedServices);
        setCategories(['All', ...fetchedCategories]);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = services;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      );
    }
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const handleGetStarted = (serviceId: string) => {
    navigate(getUrl('/login', '')[0]);
    setCurrentPage(getUrl('/login', '')[0]);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(getUrl(`/services/${serviceId}`, '')[0]);
    setCurrentPage(getUrl(`/services/${serviceId}`, '')[0]);
  };

  return (
    <div className={styles.homePage}>
      <header className={styles.hero}>
        <div className={styles.heroBackground}>
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
            <circle cx="100" cy="80" r="60" fill="rgba(255,255,255,0.08)" className={styles.floatingShape} />
            <circle cx="850" cy="120" r="80" fill="rgba(255,255,255,0.06)" className={styles.floatingShapeReverse} />
            <polygon points="200,400 250,320 300,400" fill="rgba(255,255,255,0.07)" className={styles.floatingShape} style={{ animationDelay: '2s' }} />
            <rect x="700" y="350" width="80" height="80" rx="10" fill="rgba(255,255,255,0.05)" className={styles.floatingShapeReverse} style={{ animationDelay: '3s' }} />
            <circle cx="450" cy="480" r="40" fill="rgba(255,255,255,0.06)" className={styles.floatingShape} style={{ animationDelay: '1s' }} />
          </svg>
        </div>

        <div className={styles.heroContent}>
          <h1>
            <span className={styles.highlight}>Service</span>Connect
          </h1>
          <p className={styles.subtitle}>Find the right professional for your home services</p>
          
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search services"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className={styles.servicesSection}>
        <div className={styles.sectionHeader}>
          <h2>Our Services</h2>
          <p>Choose from a wide range of professional services</p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <p>No services found</p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {filteredServices.map((service) => {
              const icon = getServiceIcon(service.title);
              return (
                <div key={service.id} className={styles.serviceCard} onClick={() => handleServiceClick(service.id)}>
                  <div className={styles.cardHeader}>
                    <div className={styles.serviceIconWrapper}>
                      <FontAwesomeIcon icon={icon} className={styles.serviceIcon} />
                    </div>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                  </div>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <div className={styles.serviceMeta}>
                    {service.rating && <span className={styles.rating}>⭐ {service.rating.toFixed(1)}</span>}
                    {service.price > 0 && <span className={styles.price}>From R{service.price}</span>}
                  </div>
                  <div className={styles.cardFooter}>
                    <button className={styles.getStartedBtn} onClick={(e) => { e.stopPropagation(); handleGetStarted(service.id); }}>
                      Get Started →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CHAT-FIRST SECTION */}
      <section className={styles.chatFirstSection}>
        <div className={styles.chatFirstGrid}>
          <div className={styles.chatFirstCopy}>
            <span className={styles.chatFirstEyebrow}>💬 Chat before you commit</span>
            <h2 className={styles.chatFirstTitle}>Talk to providers before you book</h2>
            <p className={styles.chatFirstSubtitle}>
              Ask questions, share photos, agree on scope — all inside ServiceConnect. Your contact details stay private until you choose to share them.
            </p>
            <ul className={styles.chatFirstFeatures}>
              <li className={styles.chatFirstFeature}>
                <span className={styles.featureIcon}>💬</span>
                <div><strong>Chat first</strong><p>Message multiple providers, compare, then decide.</p></div>
              </li>
              <li className={styles.chatFirstFeature}>
                <span className={styles.featureIcon}>📸</span>
                <div><strong>Share photos</strong><p>Show the job so quotes are accurate from day one.</p></div>
              </li>
              <li className={styles.chatFirstFeature}>
                <span className={styles.featureIcon}>🛡️</span>
                <div><strong>Stay private</strong><p>Your address and phone stay hidden until you choose.</p></div>
              </li>
            </ul>
            <button type="button" className={styles.chatFirstCta} onClick={() => navigate(getUrl('/services', '')[0])}>
              Browse providers →
            </button>
          </div>

          <div className={styles.chatFirstMock}>
            <div className={styles.mockCard}>
              <div className={styles.mockHeader}>
                <div className={styles.mockAvatar}>TB</div>
                <div className={styles.mockHeaderInfo}>
                  <span className={styles.mockName}>Tom Brown</span>
                  <span className={styles.mockMeta}>⭐ 4.8 · 46 jobs</span>
                </div>
              </div>
              <div className={styles.mockBody}>
                <div className={styles.mockBubbleOther}><span>Hi! My kitchen sink is leaking. Can you help this week?</span></div>
                <div className={styles.mockBubbleOwn}><span>Looks like a worn seal — around R350, confirmed on-site.</span></div>
              </div>
            </div>
            <div className={styles.mockGlow} aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;