// src/components/Client/ServiceCard.tsx
import React from 'react';
import type { Service } from '../../types/service.types';
import { MapPin, Star, User, Clock } from 'lucide-react';
import styles from './ServiceCard.module.scss';

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
  onHire: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onViewDetails, 
  onHire 
}) => {
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceCardBody}>
        {/* Category Badge & Rating */}
        <div className={styles.serviceCardHeader}>
          <span className={styles.categoryBadge}>
            {service.category}
          </span>
          {service.rating && (
            <div className={styles.ratingBadge}>
              <Star className={styles.starIcon} />
              <span>{service.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={styles.serviceTitle}>
          {service.title}
        </h3>

        {/* Description */}
        <p className={styles.serviceDescription}>
          {service.description}
        </p>

        {/* Details */}
        <div className={styles.serviceDetails}>
          {/* Location */}
          <div className={styles.detailItem}>
            <MapPin />
            <span>{service.location}</span>
          </div>

          {/* Provider */}
          {service.provider_name && (
            <div className={styles.detailItem}>
              <User />
              <span>{service.provider_name}</span>
            </div>
          )}

          {/* Estimated Duration */}
          {service.estimatedDuration && (
            <div className={styles.detailItem}>
              <Clock />
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
            onClick={() => onViewDetails(service)}
            className={styles.viewDetailsBtn}
          >
            View Details
          </button>
          <button
            onClick={() => onHire(service)}
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
