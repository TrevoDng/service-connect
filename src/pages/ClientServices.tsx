// src/pages/ClientServices.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../account/context/AuthContext';
import { serviceService } from '../services/service.service';
import { Service, ServiceFilterOptions } from '../types/service.types';
import { ServicesGrid } from '../components/Client/ServicesGrid';
import { ServicesFilter } from '../components/Client/ServicesFilter';

export const ClientServices: React.FC = () => {
  const { isClient } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState<ServiceFilterOptions>({
    searchQuery: '',
    categories: [],
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  // Fetch services when filters change
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
    // Navigate to service details page
    console.log('View service:', service.id);
  };

  const handleHire = (service: Service) => {
    // Navigate to booking/contact page
    console.log('Hire service:', service.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Services</h1>
        <p className="text-gray-600">Browse available services from our trusted providers</p>
      </div>

      {/* Filter Component */}
      <div className="mb-8">
        <ServicesFilter 
          onFilterChange={handleFilterChange}
          availableCategories={categories}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading services...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No services found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
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