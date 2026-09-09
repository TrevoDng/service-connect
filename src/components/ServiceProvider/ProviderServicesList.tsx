// src/components/ServiceProvider/ProviderServicesList.tsx
import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/service.service';
import type { Service } from '../../types/service.types';
import styles from './ProviderServicesList.module.scss';

interface ProviderServicesListProps {
  onStatsUpdate: () => void;
}

export const ProviderServicesList: React.FC<ProviderServicesListProps> = ({ onStatsUpdate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getProviderServices();
      setServices(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.deleteService(id);
        await fetchServices();
        onStatsUpdate();
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusCompleted;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div className={styles.spinnerSmall}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p>{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>You haven't added any services yet.</p>
        <p>Click "Add New Service" to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.servicesList}>
      {services.map((service) => (
        <div key={service.id} className={styles.serviceItem}>
          <div className={styles.serviceItemHeader}>
            <div className={styles.serviceInfo}>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              <div className={styles.serviceMeta}>
                <span>Category: {service.category}</span>
                {service.price && <span>R{service.price}</span>}
                <span>Location: {service.location}</span>
              </div>
            </div>
            <div className={styles.serviceActions}>
              <span className={`${styles.statusBadge} ${getStatusClass(service.status)}`}>
                {service.status}
              </span>
              <button
                onClick={() => handleDelete(service.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProviderServicesList;
