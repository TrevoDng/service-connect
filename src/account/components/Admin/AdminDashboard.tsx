// src/account/components/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserTie, 
  faUserCog, 
  faClock,
  faSearch,
  faSignOutAlt,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import styles from './AdminDashboard.module.scss';

// Demo data interfaces
interface Client {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  bookings: number;
}

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  category: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  services: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  lastLogin: string;
}

interface AdminDashboardProps {
  // Props can be added later
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'employees' | 'providers' | 'clients'>('employees');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Demo data
  const demoClients: Client[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      joinDate: '2026-01-15T10:00:00',
      bookings: 5
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      joinDate: '2026-02-20T14:00:00',
      bookings: 3
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      status: 'pending',
      joinDate: '2026-03-10T09:00:00',
      bookings: 0
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      status: 'inactive',
      joinDate: '2026-01-05T08:00:00',
      bookings: 8
    }
  ];

  const demoProviders: ServiceProvider[] = [
    {
      id: '1',
      name: 'Tom Brown',
      email: 'tom@provider.com',
      category: 'Plumbing',
      status: 'active',
      rating: 4.8,
      services: 12
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily@provider.com',
      category: 'Electrical',
      status: 'active',
      rating: 4.9,
      services: 8
    },
    {
      id: '3',
      name: 'Chris Miller',
      email: 'chris@provider.com',
      category: 'Gardening',
      status: 'pending',
      rating: 4.5,
      services: 0
    },
    {
      id: '4',
      name: 'Lisa Anderson',
      email: 'lisa@provider.com',
      category: 'Cleaning',
      status: 'active',
      rating: 4.7,
      services: 15
    }
  ];

  const demoEmployees: Employee[] = [
    {
      id: '1',
      name: 'David Clark',
      email: 'david@company.com',
      role: 'Support Agent',
      status: 'active',
      joinDate: '2026-01-10T08:00:00',
      lastLogin: '2026-09-09T14:30:00'
    },
    {
      id: '2',
      name: 'Emma White',
      email: 'emma@company.com',
      role: 'Operations Manager',
      status: 'active',
      joinDate: '2026-02-15T09:00:00',
      lastLogin: '2026-09-09T10:15:00'
    },
    {
      id: '3',
      name: 'James Taylor',
      email: 'james@company.com',
      role: 'Support Agent',
      status: 'pending',
      joinDate: '2026-09-01T11:00:00',
      lastLogin: '-'
    },
    {
      id: '4',
      name: 'Olivia Martin',
      email: 'olivia@company.com',
      role: 'Finance',
      status: 'active',
      joinDate: '2026-03-20T13:00:00',
      lastLogin: '2026-09-08T16:45:00'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(demoClients);
      setProviders(demoProviders);
      setEmployees(demoEmployees);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials
  const getInitials = () => {
    if (!user) return 'A';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'A';
  };

  // Get user full name
  const getFullName = () => {
    if (!user) return 'Admin';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first} ${last}`.trim() || 'Admin';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    if (dateString === '-') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get stats
  const stats = [
    {
      key: 'employees',
      label: 'Total Employees',
      value: employees.length,
      icon: faUserCog,
      className: styles.statEmployees
    },
    {
      key: 'providers',
      label: 'Service Providers',
      value: providers.length,
      icon: faUserTie,
      className: styles.statProviders
    },
    {
      key: 'clients',
      label: 'Total Clients',
      value: clients.length,
      icon: faUsers,
      className: styles.statClients
    },
    {
      key: 'pending',
      label: 'Pending Approvals',
      value: [...employees, ...providers, ...clients].filter(item => item.status === 'pending').length,
      icon: faClock,
      className: styles.statPending
    }
  ];

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'pending':
        return styles.statusPending;
      case 'inactive':
        return styles.statusInactive;
      case 'completed':
        return styles.statusCompleted;
      default:
        return '';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'pending':
        return <FontAwesomeIcon icon={faClock} />;
      case 'inactive':
        return <FontAwesomeIcon icon={faTimesCircle} />;
      default:
        return null;
    }
  };

  // Get content title
  const getContentTitle = () => {
    switch (activeTab) {
      case 'employees':
        return 'Employee Management';
      case 'providers':
        return 'Service Provider Management';
      case 'clients':
        return 'Client Management';
      default:
        return 'Admin Dashboard';
    }
  };

  return (
    <div className={`${styles.dashboard} ${theme}-theme`}>
      <div className={styles.dashboardContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.avatar}>
              {getInitials()}
            </div>
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>{getFullName()}</h3>
              <span className={styles.userRole}>Administrator</span>
              <p className={styles.userEmail}>{user?.email || 'admin@email.com'}</p>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${activeTab === 'employees' ? styles.active : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <FontAwesomeIcon icon={faUserCog} />
              <span>Employees</span>
              <span className={styles.badge}>{employees.length}</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'providers' ? styles.active : ''}`}
              onClick={() => setActiveTab('providers')}
            >
              <FontAwesomeIcon icon={faUserTie} />
              <span>Service Providers</span>
              <span className={styles.badge}>{providers.length}</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'clients' ? styles.active : ''}`}
              onClick={() => setActiveTab('clients')}
            >
              <FontAwesomeIcon icon={faUsers} />
              <span>Clients</span>
              <span className={styles.badge}>{clients.length}</span>
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h2>{getContentTitle()}</h2>
            <div className={styles.headerActions}>
              <div className={styles.searchBox}>
                <FontAwesomeIcon icon={faSearch} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
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

          {/* Content based on active tab */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading data...</p>
            </div>
          ) : activeTab === 'employees' ? (
            employees.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👔</span>
                <h3>No employees found</h3>
                <p>There are no employees registered yet.</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {employees.map((employee) => (
                  <div key={employee.id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <div className={styles.activityTitle}>
                        <h4>{employee.name}</h4>
                        <span className={`${styles.statusBadge} ${getStatusClass(employee.status)}`}>
                          {getStatusIcon(employee.status)}
                          {employee.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}>{employee.email}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Role:</span>
                        <span className={styles.infoValue}>{employee.role}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Joined:</span>
                        <span className={styles.infoValue}>{formatDate(employee.joinDate)}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Last Login:</span>
                        <span className={styles.infoValue}>{formatDateTime(employee.lastLogin)}</span>
                      </div>
                    </div>
                    <div className={styles.activityActions}>
                      <button className={styles.viewBtn}>
                        <FontAwesomeIcon icon={faEye} />
                        View Details
                      </button>
                      {employee.status === 'pending' && (
                        <>
                          <button className={styles.approveBtn}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Approve
                          </button>
                          <button className={styles.rejectBtn}>
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'providers' ? (
            providers.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👔</span>
                <h3>No service providers found</h3>
                <p>There are no service providers registered yet.</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {providers.map((provider) => (
                  <div key={provider.id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <div className={styles.activityTitle}>
                        <h4>{provider.name}</h4>
                        <span className={`${styles.statusBadge} ${getStatusClass(provider.status)}`}>
                          {getStatusIcon(provider.status)}
                          {provider.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}>{provider.email}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Category:</span>
                        <span className={styles.infoValue}>{provider.category}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Rating:</span>
                        <span className={styles.infoValue}>⭐ {provider.rating.toFixed(1)}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Services:</span>
                        <span className={styles.infoValue}>{provider.services}</span>
                      </div>
                    </div>
                    <div className={styles.activityActions}>
                      <button className={styles.viewBtn}>
                        <FontAwesomeIcon icon={faEye} />
                        View Details
                      </button>
                      {provider.status === 'pending' && (
                        <>
                          <button className={styles.approveBtn}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Approve
                          </button>
                          <button className={styles.rejectBtn}>
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            clients.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👥</span>
                <h3>No clients found</h3>
                <p>There are no clients registered yet.</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {clients.map((client) => (
                  <div key={client.id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <div className={styles.activityTitle}>
                        <h4>{client.name}</h4>
                        <span className={`${styles.statusBadge} ${getStatusClass(client.status)}`}>
                          {getStatusIcon(client.status)}
                          {client.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}>{client.email}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Joined:</span>
                        <span className={styles.infoValue}>{formatDate(client.joinDate)}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Bookings:</span>
                        <span className={styles.infoValue}>{client.bookings}</span>
                      </div>
                    </div>
                    <div className={styles.activityActions}>
                      <button className={styles.viewBtn}>
                        <FontAwesomeIcon faEye />
                        View Details
                      </button>
                      {client.status === 'pending' && (
                        <>
                          <button className={styles.approveBtn}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Approve
                          </button>
                          <button className={styles.rejectBtn}>
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
