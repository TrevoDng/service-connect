// src/components/ServiceProvider/ProviderServicesList.tsx
import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/service.service';
import type { Service } from '../../types/service.types';

interface ProviderServicesListProps {
  onStatsUpdate: () => void;
}

export const ProviderServicesList: React.FC<ProviderServicesListProps> = ({ onStatsUpdate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getProviderServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
        <p style={{ color: '#6b7280' }}>You haven't added any services yet.</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Click "Add New Service" to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {services.map((service) => (
        <div key={service.id} style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>{service.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>{service.description}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>Category: {service.category}</span>
                <span style={{ color: '#6b7280' }}>Price: ${service.price}</span>
                <span style={{ color: '#6b7280' }}>Location: {service.location}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem', 
                fontWeight: '500',
                background: service.status === 'active' ? '#dcfce7' : 
                          service.status === 'pending' ? '#fef9c3' : '#f3f4f6',
                color: service.status === 'active' ? '#166534' : 
                       service.status === 'pending' ? '#854d0e' : '#6b7280'
              }}>
                {service.status}
              </span>
              <button
                onClick={() => handleDelete(service.id)}
                style={{ 
                  color: '#dc2626', 
                  background: 'none', 
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
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

/*
import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/service.service';
import type { Service } from '../../types/service.types';

// ✅ Add the interface
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

  const handleStatusToggle = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await serviceService.updateServiceStatus(serviceId, newStatus as 'active' | 'inactive');
      setServices(prev => prev.map(s => 
        s.id === serviceId ? { ...s, status: newStatus as any } : s
      ));
      onStatsUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await serviceService.deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      onStatsUpdate();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div>
      {services.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven't listed any services yet.</p>
          <p className="text-sm text-gray-400">Click "Add New Service" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {service.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {service.location}
                    </span>
                    {service.price > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        R{service.price}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : service.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Bookings: {service.bookings_count || 0} | Added: {new Date(service.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleStatusToggle(service.id, service.status)}
                    className={`px-3 py-1 text-sm rounded ${
                      service.status === 'active'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {service.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
*/