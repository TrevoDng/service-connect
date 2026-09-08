// src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import { demoServices, categories } from '../data/demoServices';
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
  const [filteredServices, setFilteredServices] = useState(demoServices);
  const [loading, setLoading] = useState(false);

  // Filter services based on search and category
  useEffect(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      let filtered = demoServices;
      
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
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

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
            <polygon points="550,150 580,100 610,150 580,200" fill="rgba(255,255,255,0.07)" className={styles.floatingShapeReverse} style={{ animationDelay: '2.5s' }} />
            <circle cx="150" cy="450" r="50" fill="rgba(255,255,255,0.05)" className={styles.floatingShape} style={{ animationDelay: '3.5s' }} />
            <polygon points="780,480 810,460 840,480 840,510 810,530 780,510" fill="rgba(255,255,255,0.06)" className={styles.floatingShapeReverse} style={{ animationDelay: '1.5s' }} />
            <circle cx="350" cy="180" r="30" fill="rgba(255,255,255,0.07)" className={styles.floatingShape} style={{ animationDelay: '4s' }} />
          </svg>
        </div>

        <div className={styles.heroContent}>
          <h1>
            <span className={styles.highlight}>Service</span>Connect
          </h1>
          <p className={styles.subtitle}>
            Find the right professional for your home services
          </p>
          
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
                <option key={category} value={category}>
                  {category}
                </option>
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
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {filteredServices.map((service) => {
              const icon = getServiceIcon(service.title);
              return (
                <div 
                  key={service.id} 
                  className={styles.serviceCard}
                  onClick={() => handleServiceClick(service.id)}
                >
                  <div className={styles.serviceIconWrapper}>
                    <FontAwesomeIcon 
                      icon={icon} 
                      className={styles.serviceIcon}
                    />
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <div className={styles.serviceMeta}>
                    {service.rating && (
                      <span className={styles.rating}>
                        ⭐ {service.rating.toFixed(1)}
                      </span>
                    )}
                    {service.price && (
                      <span className={styles.price}>{service.price}</span>
                    )}
                    {service.providerCount && (
                      <span className={styles.providers}>
                        👤 {service.providerCount} providers
                      </span>
                    )}
                  </div>
                  <button 
                    className={styles.getStartedBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetStarted(service.id);
                    }}
                  >
                    Get Started →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
