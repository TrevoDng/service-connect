// src/pages/ProviderDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { AddServiceForm } from '../../components/ServiceProvider/AddServiceForm';
import { ProviderServicesList } from '../../components/ServiceProvider/ProviderServicesList';
import { serviceService } from '../../services/service.service';
import type { ServiceStats } from '../../types/service.types';
import './ProviderDashboard.css'; // Import the CSS file

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

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

  const handleTabChange = (tab: 'list' | 'add') => {
    setActiveTab(tab);
    if (tab === 'list') {
      fetchStats();
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  const statItems = [
    { key: 'total', label: 'Total Services', value: stats.total, icon: '📊', className: 'total' },
    { key: 'active', label: 'Active', value: stats.active, icon: '✅', className: 'active' },
    { key: 'pending', label: 'Pending', value: stats.pending, icon: '⏳', className: 'pending' },
    { key: 'bookings', label: 'Bookings', value: stats.completed, icon: '📅', className: 'bookings' }
  ];

  return (
    <div className="provider-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Service Provider Dashboard</h1>
          <p className="subtitle">Manage your services and track performance</p>
        </div>
        <div className="welcome-badge">
          <p>
            Welcome back, <span className="provider-name">
              {user?.firstName || 'Provider'} {user?.lastName || ''}
            </span>
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.key} className={`stat-card ${item.className}`}>
            <div className="stat-info">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{item.value}</span>
            </div>
            <span className="stat-icon">{item.icon}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => handleTabChange('list')}
        >
          My Services
        </button>
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => handleTabChange('add')}
        >
          Add New Service
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'list' ? (
          <ProviderServicesList onStatsUpdate={fetchStats} />
        ) : (
          <AddServiceForm onServiceAdded={() => handleTabChange('list')} />
        )}
      </div>
    </div>
  );
};

/*
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { AddServiceForm } from '../../components/ServiceProvider/AddServiceForm';
import { ProviderServicesList } from '../../components/ServiceProvider/ProviderServicesList';
import { serviceService } from '../../services/service.service';
import type { ServiceStats } from '../../types/service.types';

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

  const handleTabChange = (tab: 'list' | 'add') => {
    setActiveTab(tab);
    if (tab === 'list') {
      fetchStats();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  // Get color for each stat card
  const getCardColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700',
      'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700',
      'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
      'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700'
    ];
    return colors[index % colors.length];
  };

  const getIcon = (index: number) => {
    const icons = ['📊', '✅', '⏳', '📅'];
    return icons[index % icons.length];
  };

  const statItems = [
    { label: 'Total Services', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Pending', value: stats.pending },
    { label: 'Bookings', value: stats.completed }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header *}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Service Provider Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your services and track performance
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Welcome back, <span className="font-semibold text-gray-900 dark:text-white">
                {user?.firstName || 'Provider'} {user?.lastName || ''}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards *}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statItems.map((item, index) => (
          <div
            key={item.label}
            className={`${getCardColor(index)} p-6 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 transform`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{item.label}</p>
                <p className="text-3xl font-bold mt-1">{item.value}</p>
              </div>
              <div className="text-4xl opacity-80">
                {getIcon(index)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs *}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('list')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Services
          </button>
          <button
            onClick={() => handleTabChange('add')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'add'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Add New Service
          </button>
        </nav>
      </div>

      {/* Content *}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'list' ? (
          <ProviderServicesList onStatsUpdate={fetchStats} />
        ) : (
          <AddServiceForm onServiceAdded={() => handleTabChange('list')} />
        )}
      </div>
    </div>
  );
};
*/