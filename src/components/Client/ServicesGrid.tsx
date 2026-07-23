// src/components/Client/ServicesGrid.tsx
import React from 'react';
import { Service } from '../../types/service.types';
import { ServiceCard } from './ServiceCard';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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