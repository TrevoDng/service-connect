// src/account/components/Employee/EmployeeDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserTie, 
  faClock, 
  faCalendarCheck,
  faSearch,
  faSignOutAlt,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faClipboardList,
  faUserPlus,
  faChartLine,
  faCog,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import styles from './EmployeeDashboard.module.scss';

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

interface Booking {
  id: string;
  clientName: string;
  providerName: string;
  serviceTitle: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

interface EmployeeDashboardProps {
  // Props can be added later
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'clients' | 'providers' | 'bookings'>('clients');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

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

  const demoBookings: Booking[] = [
    {
      id: '1',
      clientName: 'John Doe',
      providerName: 'Tom Brown',
      serviceTitle: 'Plumbing Repair',
      date: '2026-09-10T14:00:00',
      status: 'pending',
      price: 350
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      providerName: 'Emily Davis',
      serviceTitle: 'Electrical Installation',
      date: '2026-09-08T09:00:00',
      status: 'confirmed',
      price: 450
    },
    {
      id: '3',
      clientName: 'Mike Johnson',
      providerName: 'Lisa Anderson',
      serviceTitle: 'Garden Maintenance',
      date: '2026-09-05T10:00:00',
      status: 'completed',
      price: 250
    },
    {
      id: '4',
      clientName: 'Sarah Wilson',
      providerName: 'Tom Brown',
      serviceTitle: 'Renovation Project',
      date: '2026-09-01T08:00:00',
      status: 'cancelled',
      price: 800
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setClients(demoClients);
      setProviders(demoProviders);
      setBookings(demoBookings);
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
    if (!user) return 'E';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'E';
  };

  // Get user full name
  const getFullName = () => {
    if (!user) return 'Employee';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first} ${last}`.trim() || 'Employee';
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

  // Get stats
  const stats = [
    {
      key: 'clients',
      label: 'Total Clients',
      value: clients.length,
      icon: faUsers,
      className: styles.statClients
    },
    {
      key: 'providers',
      label: 'Service Providers',
      value: providers.length,
      icon: faUserTie,
      className: styles.statProviders
    },
    {
      key: 'pending',
      label: 'Pending Approvals',
      value: [...clients, ...providers].filter(item => item.status === 'pending').length,
      icon: faClock,
      className: styles.statPending
    },
    {
      key: 'bookings',
      label: 'Total Bookings',
      value: bookings.length,
      icon: faCalendarCheck,
      className: styles.statBookings
    }
  ];

  // Get status class for clients/providers
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
      case 'cancelled':
        return <FontAwesomeIcon icon={faTimesCircle} />;
      default:
        return null;
    }
  };

  // Get content title based on active tab
  const getContentTitle = () => {
    switch (activeTab) {
      case 'clients':
        return 'Client Management';
      case 'providers':
        return 'Service Provider Management';
      case 'bookings':
        return 'Booking Overview';
      default:
        return 'Dashboard';
    }
  };

  // Get empty message based on active tab
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'clients':
        return {
          title: 'No clients found',
          message: 'There are no clients registered yet.'
        };
      case 'providers':
        return {
          title: 'No service providers found',
          message: 'There are no service providers registered yet.'
        };
      case 'bookings':
        return {
          title: 'No bookings found',
          message: 'There are no bookings to display at this time.'
        };
      default:
        return {
          title: 'No data found',
          message: 'Nothing to display here.'
        };
    }
  };

  const emptyMessage = getEmptyMessage();

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
              <span className={styles.userRole}>Employee</span>
              <p className={styles.userEmail}>{user?.email || 'employee@email.com'}</p>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${activeTab === 'clients' ? styles.active : ''}`}
              onClick={() => setActiveTab('clients')}
            >
              <FontAwesomeIcon icon={faUsers} />
              <span>Clients</span>
              <span className={styles.badge}>{clients.length}</span>
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
              className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Bookings</span>
              <span className={styles.badge}>{bookings.length}</span>
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

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h3>Quick Actions</h3>
            <div className={styles.actionsGrid}>
              <button className={styles.actionBtn} onClick={() => navigate('/admin-dashboard')}>
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Add New Client</span>
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/admin-dashboard')}>
                <FontAwesomeIcon icon={faUserTie} />
                <span>Approve Provider</span>
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/admin-dashboard')}>
                <FontAwesomeIcon icon={faChartLine} />
                <span>View Reports</span>
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/admin-dashboard')}>
                <FontAwesomeIcon icon={faCog} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading data...</p>
            </div>
          ) : activeTab === 'clients' ? (
            clients.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👥</span>
                <h3>{emptyMessage.title}</h3>
                <p>{emptyMessage.message}</p>
                <button 
                  className={styles.approveBtn}
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Add New Client
                </button>
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
                        <FontAwesomeIcon icon={faEye} />
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
          ) : activeTab === 'providers' ? (
            providers.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>👔</span>
                <h3>{emptyMessage.title}</h3>
                <p>{emptyMessage.message}</p>
                <button 
                  className={styles.approveBtn}
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Add New Provider
                </button>
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
            bookings.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📋</span>
                <h3>{emptyMessage.title}</h3>
                <p>{emptyMessage.message}</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <div className={styles.activityTitle}>
                        <h4>{booking.serviceTitle}</h4>
                        <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Client:</span>
                        <span className={styles.infoValue}>{booking.clientName}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Provider:</span>
                        <span className={styles.infoValue}>{booking.providerName}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Date:</span>
                        <span className={styles.infoValue}>{formatDate(booking.date)}</span>
                      </div>
                      <div className={styles.activityInfo}>
                        <span className={styles.infoLabel}>Price:</span>
                        <span className={styles.infoValue}>R{booking.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={styles.activityActions}>
                      <button className={styles.viewBtn}>
                        <FontAwesomeIcon icon={faEye} />
                        View Details
                      </button>
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

export default EmployeeDashboard;
