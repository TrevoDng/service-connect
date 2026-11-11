// src/account/components/Employee/EmployeeDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserTie,
  faClock,
  faSearch,
  faCheckCircle,
  faClipboardList,
  faComments,
  faGavel,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardLayout, DashboardSidebar } from '../../../components/layout';
import type { SidebarNavItem } from '../../../components/layout';
import { DisputesView } from '../../../components/Disputes';
import { MessagesView } from '../../../components/Chat';
import styles from './EmployeeDashboard.module.scss';
import { disputeService } from '../../../services/dispute.service';
import { adminService, type ApiUser } from '../../../services/admin.service';
import { StaffBookingsView } from '../../../components/Bookings';
import { StaffUserDetailPanel } from '../../../components/Bookings';
import { StaffSupportView } from '../../../components/Support';
import { useStaffSupportUnreadCount } from '../../../hooks/useStaffSupportUnreadCount';

// ============================================
// TYPES
// ============================================

type EmployeeTab = 'clients' | 'providers' | 'bookings' | 'disputes' | 'messages'  | 'support-tickets';

// ============================================
// EMPLOYEE THEME CONSTANTS
// ============================================

const EMPLOYEE_ACCENT = '#10b981';
const EMPLOYEE_GRADIENT = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
const EMPLOYEE_HOVER_BG = 'rgba(16, 185, 129, 0.08)';
const EMPLOYEE_ACTIVE_BG = 'rgba(16, 185, 129, 0.12)';
const EMPLOYEE_ROLE_BG = 'rgba(16, 185, 129, 0.1)';

// ============================================
// COMPONENT
// ============================================

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [openDisputeCount, setOpenDisputeCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const supportBadge = useStaffSupportUnreadCount(user?.id ?? null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const VALID_TABS: EmployeeTab[] = [
    'clients', 'providers', 'bookings', 'disputes', 'messages', 'support-tickets'
  ];

  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<EmployeeTab>(()=> 
    VALID_TABS.includes(tabFromUrl as EmployeeTab)
      ? (tabFromUrl as EmployeeTab)
      : 'clients');

  useEffect(() => {
    if (
      tabFromUrl &&
      VALID_TABS.includes(tabFromUrl as EmployeeTab) &&
      tabFromUrl !== activeTab
    ) {
      setActiveTab(tabFromUrl as EmployeeTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [tabFromUrl]);

  useEffect(() => {
    setSelectedUserId(null);
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allUsers, disputes] = await Promise.all([
          adminService.getAllUsers(),
          disputeService.getMyDisputes(),
        ]);
        setUsers(allUsers);
        setOpenDisputeCount(
          disputes.filter(
            (d) => d.status === 'open' || d.status === 'awaiting_info'
          ).length
        );
      } catch (error) {
        console.error('Failed to fetch employee data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clients = useMemo(
    () => users.filter((u) => u.role === 'CLIENT'),
    [users]
  );
  const providers = useMemo(
    () => users.filter((u) => u.role === 'PROVIDER'),
    [users]
  );

  // ------------------------------------------
  // Search filtering
  // ------------------------------------------
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [providers, searchQuery]);

  // ------------------------------------------
  // Actions
  // ------------------------------------------
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ------------------------------------------
  // Formatters
  // ------------------------------------------
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ------------------------------------------
  // Status helpers (aligned with backend User.status enum)
  // ------------------------------------------
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'pending_email':
      case 'email_verified':
      case 'pending_approval':
        return styles.statusPending;
      case 'rejected':
      case 'deactivated':
        return styles.statusInactive;
      default:
        return styles.statusInactive;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending_email':
        return 'Pending email';
      case 'email_verified':
        return 'Email verified';
      case 'pending_approval':
        return 'Pending approval';
      case 'rejected':
        return 'Rejected';
      case 'deactivated':
        return 'Deactivated';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => (
    <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  );

  // ------------------------------------------
  // Stats
  // ------------------------------------------
  const pendingCount = useMemo(
    () =>
      [...clients, ...providers].filter(
        (u) => u.status === 'pending_approval'
      ).length,
    [clients, providers]
  );

  const activeCount = useMemo(
    () =>
      [...clients, ...providers].filter((u) => u.status === 'active').length,
    [clients, providers]
  );

  const stats = [
    { key: 'clients', label: 'Total Clients', value: clients.length, icon: faUsers, className: styles.statClients },
    { key: 'providers', label: 'Service Providers', value: providers.length, icon: faUserTie, className: styles.statProviders },
    { key: 'pending', label: 'Pending Accounts', value: pendingCount, icon: faClock, className: styles.statPending },
    { key: 'active', label: 'Active Users', value: activeCount, icon: faCheckCircle, className: styles.statBookings },
  ];

  // ------------------------------------------
  // Sidebar nav items
  // ------------------------------------------
  const navItems: SidebarNavItem[] = [
    { key: 'clients', label: 'Clients', icon: faUsers, badge: clients.length },
    { key: 'providers', label: 'Service Providers', icon: faUserTie, badge: providers.length },
    { key: 'bookings', label: 'Bookings', icon: faClipboardList },
    { key: 'disputes', label: 'Disputes', icon: faGavel, badge: openDisputeCount || undefined },
    { key: 'messages', label: 'Messages', icon: faComments },
    { key: 'support-tickets', label: 'Support Tickets', icon: faHeadset,
      badge:
    activeTab === 'support-tickets' ? undefined : supportBadge || undefined,
    },
  ];

  // ------------------------------------------
  // Card renderer (client + provider share the same shape)
  // ------------------------------------------
  const renderUserCard = (u: ApiUser) => (
    <div
      key={u.id}
      className={styles.activityCard}
      onClick={() => setSelectedUserId(u.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedUserId(u.id);
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.activityHeader}>
        <div className={styles.activityTitle}>
          <h4>
            {u.firstName} {u.lastName}
          </h4>
          {getStatusBadge(u.status)}
        </div>
      </div>
      <div className={styles.activityDetails}>
        <div className={styles.activityInfo}>
          <span className={styles.infoLabel}>Email:</span>
          <span className={styles.infoValue}>{u.email}</span>
        </div>
        {u.phone && (
          <div className={styles.activityInfo}>
            <span className={styles.infoLabel}>Phone:</span>
            <span className={styles.infoValue}>{u.phone}</span>
          </div>
        )}
        <div className={styles.activityInfo}>
          <span className={styles.infoLabel}>Joined:</span>
          <span className={styles.infoValue}>{formatDate(u.createdAt)}</span>
        </div>
        {u.lastLogin && (
          <div className={styles.activityInfo}>
            <span className={styles.infoLabel}>Last login:</span>
            <span className={styles.infoValue}>{formatDateTime(u.lastLogin)}</span>
          </div>
        )}
        
        {u.role === 'PROVIDER' && u.serviceType && (
          <div className={styles.activityInfo}>
            <span className={styles.infoLabel}>Service type:</span>
            <span className={styles.infoValue}>{u.serviceType}</span>
          </div>
        )}
        {u.role === 'PROVIDER' && u.companyName && (
          <div className={styles.activityInfo}>
            <span className={styles.infoLabel}>Company:</span>
            <span className={styles.infoValue}>{u.companyName}</span>
          </div>
        )}
        {u.role === 'PROVIDER' && u.registrationNumber && (
          <div className={styles.activityInfo}>
            <span className={styles.infoLabel}>Reg. number:</span>
            <span className={styles.infoValue}>{u.registrationNumber}</span>
          </div>
        )}
      </div>
    </div>
  );

  // ------------------------------------------
  // Main content dispatch
  // ------------------------------------------
  const renderMainContent = () => {
    // Disputes
    if (activeTab === 'disputes') {
      return (
        <div className={styles.mainContent}>
          <DisputesView viewerRole="EMPLOYEE" />
        </div>
      );
    }

    // Messages
    if (activeTab === 'messages') {
      return (
        <div className={styles.mainContent}>
          <MessagesView viewerRole="EMPLOYEE" observerMode />
        </div>
      );
    }

    if (activeTab === 'support-tickets') {
      return (
        <div className={styles.mainContent}>
          <StaffSupportView viewerRole="EMPLOYEE" />
        </div>
      );
    }

    // Bookings — placeholder for this step
    if (activeTab === 'bookings') {
      return (
        <div className={styles.mainContent}>
          <StaffBookingsView viewerRole="EMPLOYEE" users={users} />
        </div>
      );
    }

    // Clients or Providers
    const isClients = activeTab === 'clients';
    const list = isClients ? filteredClients : filteredProviders;
    const title = isClients ? 'Client Management' : 'Service Provider Management';
    const emptyIcon = isClients ? '👥' : '👔';
    const emptyTitle = searchQuery
      ? 'No matches found'
      : isClients
      ? 'No clients found'
      : 'No service providers found';
    const emptyMessage = searchQuery
      ? `No ${isClients ? 'clients' : 'providers'} match "${searchQuery}".`
      : `There are no ${isClients ? 'clients' : 'service providers'} registered yet.`;

    const selectedUser = selectedUserId
      ? users.find((u) => u.id === selectedUserId) ?? null
      : null;

    if (selectedUser) {
      return (
        <div className={styles.mainContent}>
          <StaffUserDetailPanel
            user={selectedUser}
            allUsers={users}
            canApprove={false}
            onBack={() => setSelectedUserId(null)}
          />
        </div>
      );
    }

    return (
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h2>{title}</h2>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder={isClients ? 'Search clients...' : 'Search providers...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.key} className={`${styles.statCard} ${stat.className}`}>
              <div className={styles.statIcon}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className={styles.statInfo}>
                <h3>{stat.label}</h3>
                <span className={styles.statNumber}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading data...</p>
          </div>
        ) : list.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{emptyIcon}</span>
            <h3>{emptyTitle}</h3>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className={styles.activityList}>{list.map(renderUserCard)}</div>
        )}
      </div>
    );
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <DashboardLayout
        mobileTitle="Employee Dashboard"
        sidebar={
          <DashboardSidebar
            avatarGradient={EMPLOYEE_GRADIENT}
            accentColor={EMPLOYEE_ACCENT}
            hoverBg={EMPLOYEE_HOVER_BG}
            activeBg={EMPLOYEE_ACTIVE_BG}
            roleBg={EMPLOYEE_ROLE_BG}
            roleColor={EMPLOYEE_ACCENT}
            roleLabel="Employee"
            navItems={navItems}
            activeKey={activeTab}
            onNavigate={(key) => {
              setActiveTab(key as EmployeeTab);
              setSearchParams({ tab: key }, { replace: false });
            }}
            onLogout={handleLogout}
          />
        }
      >
        {renderMainContent()}
      </DashboardLayout>
    </div>
  );
};

export default EmployeeDashboard;