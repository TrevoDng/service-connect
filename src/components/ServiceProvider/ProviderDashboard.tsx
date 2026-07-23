// src/pages/ProviderDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { AddServiceForm } from '../../components/ServiceProvider/AddServiceForm';
import { ProviderServicesList } from '../../components/ServiceProvider/ProviderServicesList';
import { serviceService } from '../../services/service.service';
import { ServiceStats } from '../../types/service.types';

export const ProviderDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  // ✅ MOVED useEffect BEFORE any conditional returns
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await serviceService.getProviderStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Now conditional returns are AFTER all hooks
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please login to access your dashboard.</p>
      </div>
    );
  }

  if (user?.role !== 'EMPLOYEE' && user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You don't have permission to access this page.</p>
        <p className="text-sm text-gray-400">Only service providers can list services.</p>
      </div>
    );
  }

  const handleTabChange = (tab: 'list' | 'add') => {
    setActiveTab(tab);
    if (tab === 'list') {
      fetchStats();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Provider Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome, {user?.firstName} {user?.lastName}
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Total Services</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <p className="text-sm text-gray-500">Bookings</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => handleTabChange('list')}
          className={`pb-2 px-4 ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Services
        </button>
        <button
          onClick={() => handleTabChange('add')}
          className={`pb-2 px-4 ${
            activeTab === 'add'
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Add New Service
        </button>
      </div>

      {/* Content */}
      {activeTab === 'list' ? (
        <ProviderServicesList onStatsUpdate={fetchStats} />
      ) : (
        <AddServiceForm onServiceAdded={() => handleTabChange('list')} />
      )}
    </div>
  );
};