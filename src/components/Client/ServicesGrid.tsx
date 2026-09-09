// src/components/Client/ServicesGrid.tsx
import React from 'react';
import type { Service } from '../../types/service.types';
import { ServiceCard } from './ServiceCard';
import styles from './ServicesGrid.module.scss';

interface ServicesGridProps {
  services: Service[];
  onViewDetails: (service: Service) => void;
  onHire: (service: Service) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ 
  services, 
  onViewDetails, 
  onHire 
}) => {
  return (
    <div className={styles.servicesGrid}>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onViewDetails={onViewDetails}
          onHire={onHire}
        />
      ))}
    </div>
  );
};

export default ServicesGrid;
