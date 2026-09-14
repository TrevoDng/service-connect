// src/components/Client/ServiceCard.tsx
import React from 'react';
import type { Service } from '../../types/service.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapPin,
  faStar,
  faUser,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ServiceCard.module.scss';

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
  onHire: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewDetails,
  onHire,
}) => {
  const handleCardClick = () => {
    onViewDetails(service);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetails(service);
    }
  };

  return (
    <div
      className={styles.serviceCard}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${service.title}`}
    >
      <div className={styles.serviceCardBody}>
        {/* Category Badge & Rating */}
        <div className={styles.serviceCardHeader}>
          <span className={styles.categoryBadge}>{service.category}</span>
          {service.rating && (
            <div className={styles.ratingBadge}>
              <FontAwesomeIcon icon={faStar} />
              <span>{service.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={styles.serviceTitle}>{service.title}</h3>

        {/* Description */}
        <p className={styles.serviceDescription}>{service.description}</p>

        {/* Details */}
        <div className={styles.serviceDetails}>
          <div className={styles.detailItem}>
            <FontAwesomeIcon icon={faMapPin} />
            <span>{service.location}</span>
          </div>

          {service.provider_name && (
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faUser} />
              <span>{service.provider_name}</span>
            </div>
          )}

          {service.estimatedDuration && (
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faClock} />
              <span>{service.estimatedDuration}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {service.price > 0 && (
          <div className={styles.servicePrice}>
            <span className={styles.priceValue}>
              R{service.price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Skills */}
        {service.skills && service.skills.length > 0 && (
          <div className={styles.serviceSkills}>
            {service.skills.slice(0, 3).map((skill) => (
              <span key={skill} className={styles.skillTag}>
                {skill}
              </span>
            ))}
            {service.skills.length > 3 && (
              <span className={styles.skillMore}>
                +{service.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.serviceActions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(service);
            }}
            className={styles.viewDetailsBtn}
          >
            View Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHire(service);
            }}
            className={styles.hireBtn}
          >
            Contact Expert
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
