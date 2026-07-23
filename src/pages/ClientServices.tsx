// src/pages/ClientServices.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../account/context/AuthContext';
import { serviceService } from '../services/service.service';
import { Service, ServiceFilterOptions } from '../types/service.types';
import { ServicesGrid } from '../components/Client/ServicesGrid';
import { ServicesFilter } from '../components/Client/ServicesFilter';
//@ts-ignore
import './ClientServices.css'; // Import the CSS

export const ClientServices: React.FC = () => {
  const { isClient } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<ServiceFilterOptions>({
    searchQuery: '',
    categories: [],
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [filters]);

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

  const handleFilterChange = (newFilters: ServiceFilterOptions) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (service: Service) => {
    console.log('View service:', service.id);
  };

  const handleHire = (service: Service) => {
    console.log('Hire service:', service.id);
  };

  return (
    <div className="client-services">
      <div className="client-services-header">
        <h1>Find Services</h1>
        <p>Browse available services from our trusted providers</p>
      </div>

      <div className="client-services-filter-section">
        <ServicesFilter 
          onFilterChange={handleFilterChange}
          availableCategories={categories}
        />
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : services.length === 0 ? (
        <div className="no-results">
          <p>No services found</p>
          <p className="sub-text">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="results-info">
            <p className="results-count">
              Showing {services.length} service{services.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ServicesGrid 
            services={services}
            onViewDetails={handleViewDetails}
            onHire={handleHire}
          />
        </>
      )}
    </div>
  );
};