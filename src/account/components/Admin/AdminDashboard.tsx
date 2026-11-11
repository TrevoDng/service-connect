// src/account/components/Admin/AdminDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserTie,
  faUserCog,
  faUserShield,
  faClock,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faGavel,
  faComments,
  faClipboardList,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';
import { MessagesView } from '../../../components/Chat';
import { DashboardLayout, DashboardSidebar } from '../../../components/layout';
import type { SidebarNavItem } from '../../../components/layout';
import { DisputesView } from '../../../components/Disputes';
import styles from './AdminDashboard.module.scss';
import { adminService, type ApiUser } from '../../../services/admin.service';
import { disputeService } from '../../../services/dispute.service';
import { StaffBookingsView, StaffUserDetailPanel } from '../../../components/Bookings';
import { RegistrationRequestsView } from '../../../components/Registration/RegistrationRequestsView';
import { faFileSignature } from '@fortawesome/free-solid-svg-icons';
import { StaffSupportView } from '../../../components/Support';
import { useStaffSupportUnreadCount } from '../../../hooks/useStaffSupportUnreadCount';
import { useSearchParams } from 'react-router-dom';

// ============================================
// TYPES
// ============================================

type AdminTab =
  | 'admins'
  | 'employees'
  | 'providers'
  | 'clients'
  | 'bookings'
  | 'disputes'
  | 'messages'
  | 'applications'
  | 'support-tickets';        // ← add


// ============================================
// ADMIN THEME CONSTANTS
// ============================================

const ADMIN_ACCENT = '#ef4444';
const ADMIN_GRADIENT = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
const ADMIN_HOVER_BG = 'rgba(239, 68, 68, 0.08)';
const ADMIN_ACTIVE_BG = 'rgba(239, 68, 68, 0.12)';
const ADMIN_ROLE_BG = 'rgba(239, 68, 68, 0.1)';

// ============================================
// COMPONENT
// ============================================

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [openDisputeCount, setOpenDisputeCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const supportBadge = useStaffSupportUnreadCount(user?.id ?? null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const VALID_TABS: AdminTab[] = [
    'admins', 'applications', 'employees', 'providers',
    'clients', 'bookings', 'disputes', 'messages', 'support-tickets',
  ];


  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    VALID_TABS.includes(tabFromUrl as AdminTab)
      ? (tabFromUrl as AdminTab)
      : 'employees'
  );

  useEffect(() => {
  if (
    tabFromUrl &&
    VALID_TABS.includes(tabFromUrl as AdminTab) &&
    tabFromUrl !== activeTab
  ) {
    setActiveTab(tabFromUrl as AdminTab);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [tabFromUrl]);

  useEffect(() => {
    setSelectedUserId(null);
  }, [activeTab]);

  // ------------------------------------------
  // Data fetch
  // ------------------------------------------
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
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------------------------
  // Derived lists
  // ------------------------------------------
  const admins = useMemo(
    () => users.filter((u) => u.role === 'ADMIN'),
    [users]
  );
  const employees = useMemo(
    () => users.filter((u) => u.role === 'EMPLOYEE'),
    [users]
  );
  const providers = useMemo(
    () => users.filter((u) => u.role === 'PROVIDER'),
    [users]
  );
  const clients = useMemo(
    () => users.filter((u) => u.role === 'CLIENT'),
    [users]
  );

  // ------------------------------------------
  // Search filtering
  // ------------------------------------------
  const filterList = (list: ApiUser[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  };

  const filteredAdmins = useMemo(
    () => filterList(admins),
    [admins, searchQuery]
  );
  const filteredEmployees = useMemo(
    () => filterList(employees),
    [employees, searchQuery]
  );
  const filteredProviders = useMemo(
    () => filterList(providers),
    [providers, searchQuery]
  );
  const filteredClients = useMemo(
    () => filterList(clients),
    [clients, searchQuery]
  );

  // ------------------------------------------
  // Approve / Reject actions
  // ------------------------------------------
  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);
      await adminService.approveUser(userId, true);
      await fetchData();
    } catch {
      alert('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    try {
      setActionLoading(userId);
      await adminService.approveUser(userId, false, reason);
      await fetchData();
    } catch {
      alert('Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

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

  // ------------------------------------------
  // Stats
  // ------------------------------------------
  const pendingCount = useMemo(
    () =>
      [...employees, ...providers].filter(
        (u) => u.status === 'pending_approval'
      ).length,
    [employees, providers]
  );

  const stats = [
    { key: 'employees', label: 'Total Employees', value: employees.length, icon: faUserCog, className: styles.statEmployees },
    { key: 'providers', label: 'Service Providers', value: providers.length, icon: faUserTie, className: styles.statProviders },
    { key: 'clients', label: 'Total Clients', value: clients.length, icon: faUsers, className: styles.statClients },
    { key: 'pending', label: 'Pending Approvals', value: pendingCount, icon: faClock, className: styles.statPending },
  ];

  // ------------------------------------------
  // Content title
  // ------------------------------------------
  const getContentTitle = () => {
    switch (activeTab) {
      case 'admins':
        return 'Administrators';
      case 'employees':
        return 'Employee Management';
      case 'providers':
        return 'Service Provider Management';
      case 'clients':
        return 'Client Management';
      case 'bookings':
        return 'Bookings';
      default:
        return 'Admin Dashboard';
    }
  };

  // ------------------------------------------
  // Sidebar nav items
  // ------------------------------------------
  const navItems: SidebarNavItem[] = [
    { key: 'admins', label: 'Administrators', icon: faUserShield, badge: admins.length },
    { key: 'applications', label: 'Applications', icon: faFileSignature },
    { key: 'employees', label: 'Employees', icon: faUserCog, badge: employees.length },
    { key: 'providers', label: 'Service Providers', icon: faUserTie, badge: providers.length },
    { key: 'clients', label: 'Clients', icon: faUsers, badge: clients.length },
    { key: 'bookings', label: 'Bookings', icon: faClipboardList },
    { key: 'disputes', label: 'Disputes', icon: faGavel, badge: openDisputeCount || undefined },
    { key: 'messages', label: 'Messages', icon: faComments },
    { key: 'support-tickets', 
      label: 'Support Tickets', 
      icon: faHeadset,
      badge: 
      activeTab === 'support-tickets' ? undefined : supportBadge || undefined,
 },
  ];

  // ------------------------------------------
  // Card renderer
  // ------------------------------------------
  // `allowApproval` is passed per list — only employees & providers
  // can approve/reject pending accounts. Clients are auto-active
  // (backend registration sets status='active' for CLIENT). Admins
  // are created by another admin with status='active' directly, so
  // there is nothing to approve — and the backend's approveEmployee
  // endpoint hard-rejects non-EMPLOYEE/PROVIDER roles anyway.
  const renderUserCard = (u: ApiUser, allowApproval: boolean) => (
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
          <span className={`${styles.statusBadge} ${getStatusClass(u.status)}`}>
            {getStatusLabel(u.status)}
          </span>
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
      </div>

      {allowApproval && u.status === 'pending_approval' && (
        <div
          className={styles.activityActions}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleApprove(u.id)}
            disabled={actionLoading === u.id}
            className={styles.approveBtn}
          >
            <FontAwesomeIcon icon={faCheckCircle} /> Approve
          </button>
          <button
            onClick={() => handleReject(u.id)}
            disabled={actionLoading === u.id}
            className={styles.rejectBtn}
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Reject
          </button>
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
  );

  // ------------------------------------------
  // Main content
  // ------------------------------------------
  const renderMainContent = () => {
    if (activeTab === 'applications') {
      return (
        <div className={styles.mainContent}>
          <RegistrationRequestsView />
        </div>
      );
    }
    if (activeTab === 'disputes') {
      return (
        <div className={styles.mainContent}>
          <DisputesView viewerRole="ADMIN" />
        </div>
      );
    }

    if (activeTab === 'messages') {
      return (
        <div className={styles.mainContent}>
          <MessagesView viewerRole="ADMIN" observerMode />
        </div>
      );
    }

    if (activeTab === 'support-tickets') {
      return (
        <div className={styles.mainContent}>
          <StaffSupportView viewerRole="ADMIN" />
        </div>
      );
    }

    if (activeTab === 'bookings') {
      return (
        <div className={styles.mainContent}>
          <StaffBookingsView viewerRole="ADMIN" users={users} />
        </div>
      );
    }

    // Admins / Employees / Providers / Clients
    let list: ApiUser[] = [];
    let emptyIcon = '👥';
    let emptyTitle = 'No data';
    let emptyMessage = '';
    let allowApproval = false;

    if (activeTab === 'admins') {
      list = filteredAdmins;
      emptyIcon = '🛡️';
      emptyTitle = searchQuery ? 'No matches found' : 'No administrators found';
      emptyMessage = searchQuery
        ? `No administrators match "${searchQuery}".`
        : 'There are no administrators registered.';
      allowApproval = false; // Admins are pre-active; nothing to approve
    } else if (activeTab === 'employees') {
      list = filteredEmployees;
      emptyIcon = '👔';
      emptyTitle = searchQuery ? 'No matches found' : 'No employees found';
      emptyMessage = searchQuery
        ? `No employees match "${searchQuery}".`
        : 'There are no employees registered yet.';
      allowApproval = true;
    } else if (activeTab === 'providers') {
      list = filteredProviders;
      emptyIcon = '🛠️';
      emptyTitle = searchQuery ? 'No matches found' : 'No service providers found';
      emptyMessage = searchQuery
        ? `No providers match "${searchQuery}".`
        : 'There are no service providers registered yet.';
      allowApproval = true;
    } else {
      list = filteredClients;
      emptyIcon = '👥';
      emptyTitle = searchQuery ? 'No matches found' : 'No clients found';
      emptyMessage = searchQuery
        ? `No clients match "${searchQuery}".`
        : 'There are no clients registered yet.';
      allowApproval = false; // Clients auto-activate on register
    }

        const selectedUser = selectedUserId
      ? users.find((u) => u.id === selectedUserId) ?? null
      : null;

    if (selectedUser) {
      return (
        <div className={styles.mainContent}>
          <StaffUserDetailPanel
            user={selectedUser}
            allUsers={users}
            canApprove={activeTab === 'employees' || activeTab === 'providers'}
            onApprove={handleApprove}
            onReject={handleReject}
            actionLoading={actionLoading}
            onBack={() => setSelectedUserId(null)}
          />
        </div>
      );
    }

    return (
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h2>{getContentTitle()}</h2>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search..."
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
          <div className={styles.activityList}>
            {list.map((u) => renderUserCard(u, allowApproval))}
          </div>
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
        mobileTitle="Admin Dashboard"
        sidebar={
          <DashboardSidebar
            avatarGradient={ADMIN_GRADIENT}
            accentColor={ADMIN_ACCENT}
            hoverBg={ADMIN_HOVER_BG}
            activeBg={ADMIN_ACTIVE_BG}
            roleBg={ADMIN_ROLE_BG}
            roleColor={ADMIN_ACCENT}
            roleLabel="Administrator"
            navItems={navItems}
            activeKey={activeTab}
            onNavigate={(key) => {
              setActiveTab(key as AdminTab);
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

export default AdminDashboard;