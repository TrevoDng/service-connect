// src/components/ServiceProvider/ProviderServicesList.tsx
import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/service.service';
import { Service } from '../../types/service.types';

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