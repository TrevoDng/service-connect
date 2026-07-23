// src/account/components/customer/CustomerAccountProfile.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
// import { useSlider } from '../../../slider/slidercontext/SliderContext';
//@ts-ignore
import './CustomerAccountProfile.css';
// import { useMainCategoryContext } from '../../../itemsComponents/products/category-filter/context/MainCategoryFilterContext';

const AccountProfile: React.FC = () => {
  const { user, logout } = useAuth();
  
    // const {hideSlider} = useSlider();
    // const {hideMainCategory} = useMainCategoryContext();
    //          //hide slider
    //              hideSlider();
    //              hideMainCategory();

  if (!user) {
    return null;
  }

  const userId = user.id;
  console.log('User ID:', userId);

  return (
  <div className="profile-page">
    <div className="profile-page__container">
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
                    <img
                      className="profile-avatar__img"
                      src={user.avatar || 'https://i.pravatar.cc/150'}
                      alt={user.firstName + ' ' + user.lastName}
                    />
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
                      Member since {new Date(user.createdAt).toLocaleDateString()}
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
                      <input
                        type="text"
                        defaultValue={user.firstName}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        defaultValue={user.lastName}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      rows={4}
                      className="form-textarea"
                      placeholder="Tell us about yourself..."
                    />
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
                    <span className="stats-item__label">Orders</span>
                    <span className="stats-item__value">12</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-item__label">Wishlist</span>
                    <span className="stats-item__value">5</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-item__label">Reviews</span>
                    <span className="stats-item__value">8</span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="links-card">
                <h4 className="links-card__title">Quick Links</h4>
                <div className="links-list">
                  {[
                    { name: 'Order History', icon: '📦' },
                    { name: 'Wishlist', link: '/wishlist', icon: '❤️' },
                    { name: 'Address Book', icon: '🏠' },
                    { name: 'Payment Methods', icon: '💳' },
                    { name: 'Security', icon: '🔒' },
                    { name: 'Notifications', icon: '🔔' },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link?.link || '#'}
                      className="links-item"
                    >
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
                      <p className="activity-text">Order #12345 shipped</p>
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
                      <p className="activity-text">Product review added</p>
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
