// src/pages/ServiceDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { serviceService } from '../services/service.service';
import type { Service } from '../types/service.types';
import { BookingRequestForm } from '../components/Requests';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faMapPin,
  faUser,
  faClock,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ServiceDetails.module.scss';

export const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchService(id);
  }, [id]);

  const fetchService = async (serviceId: string) => {
    try {
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const isClient = user?.role === 'CLIENT';
  const clientDisplayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Client';

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          {error || 'Service not found'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.serviceDetails}>
      {/* Back */}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </button>

      <div className={styles.serviceCard}>
        {/* Header */}
        <div className={styles.serviceHeader}>
          <div className={styles.serviceHeaderTop}>
            <div>
              <h1 className={styles.serviceTitle}>{service.title}</h1>
              <p className={styles.serviceCategory}>{service.category}</p>
            </div>
            {service.rating && (
              <div className={styles.serviceRating}>
                <FontAwesomeIcon icon={faStar} />
                <span>{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.serviceContent}>
          <div className={styles.serviceContentGrid}>
            {/* Left column */}
            <div className={styles.serviceDetailsLeft}>
              <div className={styles.detailSection}>
                <h2>Description</h2>
                <p>{service.description}</p>
              </div>

              <div className={styles.detailSection}>
                <h2>Skills &amp; Expertise</h2>
                <div className={styles.skillsList}>
                  {service.skills.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.serviceInfoList}>
                <div className={styles.serviceInfoItem}>
                  <FontAwesomeIcon icon={faMapPin} />
                  <span>{service.location}</span>
                </div>
                {service.provider_name && (
                  <div className={styles.serviceInfoItem}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>Provider: {service.provider_name}</span>
                  </div>
                )}
                {service.estimatedDuration && (
                  <div className={styles.serviceInfoItem}>
                    <FontAwesomeIcon icon={faClock} />
                    <span>Estimated duration: {service.estimatedDuration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — request form */}
            <aside className={styles.bookingSection}>
              {service.price > 0 && (
                <div className={styles.bookingPrice}>
                  <p className={styles.priceLabel}>Guide price</p>
                  <p className={styles.priceValue}>
                    R{service.price.toLocaleString()}
                  </p>
                </div>
              )}

              {!isAuthenticated && (
                <div className={styles.bookingLoginPrompt}>
                  <p>Please log in to request this service.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className={styles.bookingLoginButton}
                  >
                    Login to continue
                  </button>
                </div>
              )}

              {isAuthenticated && !isClient && (
                <div className={styles.bookingLoginPrompt}>
                  <p>
                    Only clients can request services. You are logged in as{' '}
                    <strong>{user?.role}</strong>.
                  </p>
                </div>
              )}

              {isAuthenticated && isClient && (
                <BookingRequestForm
                  serviceId={service.id}
                  serviceTitle={service.title}
                  serviceCategory={service.category}
                  providerId={service.providerId || 'p-001'}
                  providerDisplayName={service.provider_name || 'Provider'}
                  clientId={user.id}
                  clientDisplayName={clientDisplayName}
                  onSuccess={() => navigate('/client/dashboard')}
                />
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
