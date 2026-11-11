// src/account/components/customer/CustomerAccountProfile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
//@ts-ignore
import './CustomerAccountProfile.css';

const AccountProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const getInitials = () => {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="profile-page">
      <div className="profile-page__container">
        
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <div className="profile-card">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-header__content">
              <div>
                <h1 className="profile-header__title">My Account</h1>
                <p className="profile-header__subtitle">Manage your profile and preferences</p>
              </div>
              <button onClick={logout} className="profile-header__logout">
                Sign Out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="profile-main">
            <div className="profile-layout">
              
              {/* Left column – profile info and details */}
              <div className="profile-left">
                {/* Profile summary */}
                <div className="profile-summary">
                  <div className="profile-summary__inner">
                    <div className="profile-avatar">
                      {user.avatar ? (
                        <img
                          className="profile-avatar__img"
                          src={user.avatar}
                          alt={user.firstName + ' ' + user.lastName}
                        />
                      ) : (
                        <div className="profile-avatar__fallback">
                          {getInitials()}
                        </div>
                      )}
                      <button className="profile-avatar__edit">
                        <svg className="profile-avatar__edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="profile-info">
                      <h2 className="profile-info__name">{user.firstName} {user.lastName}</h2>
                      <p className="profile-info__email">{user.email}</p>
                      <p className="profile-info__member-since">
                        Member since {new Date(user.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account details form */}
                <div className="profile-details">
                  <h3 className="profile-details__title">Account Details</h3>
                  <div className="profile-details__form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input type="text" defaultValue={user.firstName} className="form-input" disabled style={{ opacity: 0.7 }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input type="text" defaultValue={user.lastName} className="form-input" disabled style={{ opacity: 0.7 }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" defaultValue={user.email} className="form-input" disabled style={{ opacity: 0.7 }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bio</label>
                      <textarea rows={4} className="form-textarea" placeholder="Tell us a bit about yourself..." />
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-primary">Save Changes</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column – sidebar */}
              <div className="profile-right">
                {/* Quick stats */}
                <div className="stats-card">
                  <h4 className="stats-card__title">Quick Stats</h4>
                  <div className="stats-list">
                    <div className="stats-item">
                      <span className="stats-item__label">Bookings</span>
                      <span className="stats-item__value">0</span>
                    </div>
                    <div className="stats-item">
                      <span className="stats-item__label">Consultations</span>
                      <span className="stats-item__value">0</span>
                    </div>
                    {user.role === 'PROVIDER' && (
                      <div className="stats-item">
                        <span className="stats-item__label">Reviews</span>
                        <span className="stats-item__value">0</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick links */}
                <div className="links-card">
                  <h4 className="links-card__title">Quick Links</h4>
                  <div className="links-list">
                    {[
                      { name: 'Bookings History', link: `${user.role?.toLocaleLowerCase()}/dashboard?tab=requests`, icon: '📦' },
                      { name: 'Consultations', link: `${user.role?.toLocaleLowerCase()}/dashboard?tab=consultations`, icon: '💬' },
                      { name: 'Address Book', link: `${user.role?.toLocaleLowerCase()}/dashboard?tab=address-book`, icon: '🏠' },
                      { name: 'Payment Methods', link: `${user.role?.toLocaleLowerCase()}/dashboard?tab=payment-methods`, icon: '💳' },
                      { name: 'Security', link: `${user.role?.toLocaleLowerCase()}/dashboard?tab=security`, icon: '🔒' },
                      { name: 'Notifications', link: `${user.role?.toLocaleLowerCase()}/dashboard?tab=notifications`, icon: '🔔' },
                    ].map((link) => (
                      <a key={link.name} href={link?.link || '#'} className="links-item">
                        <span className="links-item__icon">{link.icon}</span>
                        <span className="links-item__text">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="activity-card">
                  <h4 className="activity-card__title">Recent Activity</h4>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="activity-dot activity-dot--green"></span>
                      <div>
                        <p className="activity-text">Booking REG-4556 confirmed</p>
                        <p className="activity-time">2 hours ago</p>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-dot activity-dot--blue"></span>
                      <div>
                        <p className="activity-text">Password changed</p>
                        <p className="activity-time">1 day ago</p>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-dot activity-dot--yellow"></span>
                      <div>
                        <p className="activity-text">Review submitted for "Plumbing Services"</p>
                        <p className="activity-time">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;