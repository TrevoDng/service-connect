import React from 'react';
import { useNavigate } from 'react-router-dom';
//import './RoleSelector.css';

const RoleSelector: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Shop our products and manage your orders',
      icon: '🛍️',
      path: '/login',
      color: '#3b82f6'
    },
    {
      id: 'employee',
      title: 'Employee',
      description: 'Access your employee portal and manage tasks',
      icon: '👔',
      path: '/login/employee',
      color: '#10b981'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'System management and user approvals',
      icon: '⚙️',
      path: '/login/admin',
      color: '#ef4444'
    }
  ];

  return (
    <div className="role-selector">
      <div className="role-selector__container">
        <div className="role-selector__header">
          <h1 className="role-selector__title">Welcome Back</h1>
          <p className="role-selector__subtitle">Select your account type to continue</p>
        </div>

        <div className="role-selector__grid">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="role-card"
              style={{ borderTopColor: role.color }}
            >
              <div className="role-card__icon" style={{ backgroundColor: `${role.color}10` }}>
                <span style={{ fontSize: '2rem' }}>{role.icon}</span>
              </div>
              <h3 className="role-card__title">{role.title}</h3>
              <p className="role-card__description">{role.description}</p>
              <div className="role-card__arrow">→</div>
            </button>
          ))}
        </div>

        <div className="role-selector__footer">
          <p>Don't have an account? <a href="/register">Register as Customer</a></p>
          <p className="text-sm mt-2 text-gray-500">
            Employees: Contact your administrator for registration code
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;