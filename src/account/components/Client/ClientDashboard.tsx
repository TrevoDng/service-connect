// src/account/components/Client/ClientDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faHistory, 
  faPlusCircle,
  faUser,
  faSignOutAlt,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import styles from './ClientDashboard.module.scss';

// Demo data for bookings
interface Booking {
  id: string;
  serviceTitle: string;
  providerName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

interface ClientDashboardProps {
  // Props can be added later
}

export const ClientDashboard: React.FC<ClientDashboardProps> = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'bookings' | 'history' | 'new'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo data
  const demoBookings: Booking[] = [
    {
      id: '1',
      serviceTitle: 'Plumbing Repair',
      providerName: 'John Doe',
      date: '2026-09-10T14:00:00',
      status: 'pending',
      price: 350
    },
    {
      id: '2',
      serviceTitle: 'Electrical Installation',
      providerName: 'Jane Smith',
      date: '2026-09-08T09:00:00',
      status: 'confirmed',
      price: 450
    },
    {
      id: '3',
      serviceTitle: 'Garden Maintenance',
      providerName: 'Mike Johnson',
      date: '2026-09-05T10:00:00',
      status: 'completed',
      price: 250
    },
    {
      id: '4',
      serviceTitle: 'Renovation Project',
      providerName: 'Sarah Wilson',
      date: '2026-09-01T08:00:00',
      status: 'cancelled',
      price: 800
    },
    {
      id: '5',
      serviceTitle: 'Computer Repair',
      providerName: 'Tom Brown',
      date: '2026-09-12T13:00:00',
      status: 'pending',
      price: 200
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBookings(demoBookings);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className={styles.statusPending} />;
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} className={styles.statusConfirmed} />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className={styles.statusCompleted} />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faTimesCircle} className={styles.statusCancelled} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusClass = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    if (activeTab === 'history') {
      return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
    }
    if (activeTab === 'bookings') {
      return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  // Get user initials
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get user full name
  const getFullName = () => {
    if (!user) return 'User';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first} ${last}`.trim() || 'User';
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
              <p className={styles.userEmail}>{user?.email || 'user@email.com'}</p>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Services Requested</span>
              <span className={styles.badge}>
                {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}
              </span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>History</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'new' ? styles.active : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <FontAwesomeIcon icon={faPlusCircle} />
              <span>Request New Service</span>
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
            <h2>
              {activeTab === 'bookings' && 'Your Service Requests'}
              {activeTab === 'history' && 'Request History'}
              {activeTab === 'new' && 'Request a New Service'}
            </h2>
            {activeTab !== 'new' && (
              <div className={styles.headerActions}>
                <div className={styles.searchBox}>
                  <FontAwesomeIcon icon={faSearch} />
                  <input 
                    type="text" 
                    placeholder="Search requests..."
                    className={styles.searchInput}
                  />
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading your requests...</p>
            </div>
          ) : activeTab === 'new' ? (
            <div className={styles.newServiceContent}>
              <div className={styles.newServiceCard}>
                <div className={styles.newServiceIcon}>🔧</div>
                <h3>Find a Service</h3>
                <p>Search for professionals and request their services</p>
                <button 
                  className={styles.browseBtn}
                  onClick={() => navigate('/services')}
                >
                  Browse Services
                </button>
              </div>
              <div className={styles.newServiceCard}>
                <div className={styles.newServiceIcon}>📋</div>
                <h3>Quick Request</h3>
                <p>Request a service directly from your dashboard</p>
                <button 
                  className={styles.browseBtn}
                  onClick={() => navigate('/services')}
                >
                  Request Now
                </button>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <h3>No {activeTab === 'bookings' ? 'pending' : 'completed'} requests</h3>
              <p>
                {activeTab === 'bookings' 
                  ? 'You have no pending service requests. Browse services to get started!'
                  : 'Your completed and cancelled requests will appear here.'}
              </p>
              <button 
                className={styles.browseBtn}
                onClick={() => navigate('/services')}
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className={styles.bookingsList}>
              {filteredBookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <div className={styles.bookingTitle}>
                      <h4>{booking.serviceTitle}</h4>
                      <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingInfo}>
                      <span className={styles.infoLabel}>Provider:</span>
                      <span className={styles.infoValue}>{booking.providerName}</span>
                    </div>
                    <div className={styles.bookingInfo}>
                      <span className={styles.infoLabel}>Date:</span>
                      <span className={styles.infoValue}>{formatDate(booking.date)}</span>
                    </div>
                    <div className={styles.bookingInfo}>
                      <span className={styles.infoLabel}>Price:</span>
                      <span className={styles.infoValue}>R{booking.price.toLocaleString()}</span>
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className={styles.bookingActions}>
                      <button className={styles.cancelBtn}>Cancel</button>
                      <button className={styles.contactBtn}>Contact Provider</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
