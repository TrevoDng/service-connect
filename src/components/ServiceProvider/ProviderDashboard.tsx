// src/components/ServiceProvider/ProviderDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../account/context/AuthContext';
import { AddServiceForm } from './AddServiceForm';
import { ProviderServicesList } from './ProviderServicesList';
import { serviceService } from '../../services/service.service';
import type { ServiceStats } from '../../types/service.types';
import { useTheme } from '../../styles/context/ThemeContext';
import styles from './ProviderDashboard.module.scss';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
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
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const statItems = [
    { key: 'total', label: 'Total Services', value: stats.total, icon: '📊', className: styles.statTotal },
    { key: 'active', label: 'Active', value: stats.active, icon: '✅', className: styles.statActive },
    { key: 'pending', label: 'Pending', value: stats.pending, icon: '⏳', className: styles.statPending },
    { key: 'bookings', label: 'Bookings', value: stats.completed, icon: '📅', className: styles.statBookings }
  ];

  return (
    <div className={`${styles.providerDashboard} ${theme}-theme`}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1>Service Provider Dashboard</h1>
          <p className={styles.subtitle}>Manage your services and track performance</p>
        </div>
        <div className={styles.welcomeBadge}>
          <p>
            Welcome back, <span className={styles.providerName}>
              {user?.firstName || 'Provider'} {user?.lastName || ''}
            </span>
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statItems.map((item) => (
          <div key={item.key} className={`${styles.statCard} ${item.className}`}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{item.label}</span>
              <span className={styles.statValue}>{item.value}</span>
            </div>
            <span className={styles.statIcon}>{item.icon}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.dashboardTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => handleTabChange('list')}
        >
          My Services
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
          onClick={() => handleTabChange('add')}
        >
          Add New Service
        </button>
      </div>

      {/* Content */}
      <div className={styles.dashboardContent}>
        {activeTab === 'list' ? (
          <ProviderServicesList onStatsUpdate={fetchStats} />
        ) : (
          <AddServiceForm onServiceAdded={() => handleTabChange('list')} />
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
