// src/pages/ClientServices.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../services/service.service';
import type { Service, ServiceFilterOptions } from '../types/service.types';
import { ServicesGrid } from '../components/Client/ServicesGrid';
import { ServicesFilter } from '../components/Client/ServicesFilter';
import { useStartChat } from '../hooks/useStartChat';
import styles from './ClientServices.module.scss';

export interface ClientServicesProps {
  /** True when rendered as a top-level page (e.g. guest /services route). */
  standalone?: boolean;
}

export const ClientServices: React.FC<ClientServicesProps> = ({
  standalone =false,
}) => {
  const navigate = useNavigate();
  const { startChat, canStartChat } = useStartChat();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [filters, setFilters] = useState<ServiceFilterOptions>({
    searchQuery: '',
    categories: [],
    sortBy: 'recent',
  });

  const fetchCategories = async () => {
    try {
      const data = await serviceService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await serviceService.getServices(filters);
      setServices(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);


  const handleFilterChange = (newFilters: ServiceFilterOptions) => {
    setFilters(newFilters);
  };

  // Both actions lead to the details page for now.
  // A dedicated hire flow will replace `handleHire` in a later step.
  const handleViewDetails = (service: Service) => {
    navigate(`/services/${service.id}`);
  };

  const handleHire = (service: Service) => {
    // If the service has a provider attached, go to their profile
    if (service.provider_id) {
      navigate(`/providers/${service.provider_id}`);
    } else {
      // Fallback just in case a service doesn't have a provider linked
      navigate(`/services/${service.id}`);
    }
  };

const handleChat = (service: Service) => {
  // Guard: need a provider id to create or open a thread.
  // The Chat button is hidden when provider_id is missing, but we
  // double-check here in case the guard ever drifts.
  if (!service.provider_id) return;

  startChat({
    providerId: service.provider_id,
    providerDisplayName: service.provider_name || 'Provider',
    providerCategories: service.category ? [service.category] : undefined,
    providerRating: service.rating,
  });
};

    const body = (
    <>
      <div className={styles.clientServicesHeader}>
        <h1>Find Services</h1>
        <p>Browse available services from our trusted providers</p>
      </div>

      <div className={styles.clientServicesFilterSection}>
        <ServicesFilter
          onFilterChange={handleFilterChange}
          availableCategories={categories}
        />
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading services...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : services.length === 0 ? (
        <div className={styles.noResults}>
          <p>No services found</p>
          <p className={styles.subText}>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className={styles.resultsInfo}>
            <p className={styles.resultsCount}>
              Showing {services.length} service{services.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ServicesGrid
            services={services}
            onViewDetails={handleViewDetails}
            onHire={handleHire}
            onChat={canStartChat ? handleChat : undefined}
          />
        </>
      )}
    </>
  );

  return (
    <div className={`${styles.clientServices} ${standalone ? styles.standalone : ''}`}>
      {standalone ? <div className={styles.standaloneShell}>{body}</div> : body}
    </div>
  );
};

export default ClientServices;
