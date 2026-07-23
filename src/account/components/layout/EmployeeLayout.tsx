// src/components/layout/EmployeeLayout.tsx
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../styles/context/ThemeContext';
//@ts-ignore
import './EmployeeLayout.css';
//import { useSlider } from '../../../slider/slidercontext/SliderContext';

interface EmployeeLayoutProps {
  children: ReactNode;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  // const { hideSlider } = useSlider();
  // hideSlider(); // Hide the slider on employee pages
  
  const menuItems = [
    { path: '/employee', label: 'Dashboard', icon: '📊' },
    { path: '/employee/add-product', label: 'Add Product', icon: '➕' },
    { path: '/employee/my-products', label: 'My Products', icon: '📦' },
    // { path: '/employee/registration-status', label: 'Registration Status', icon: '✅' },
    { path: '/employee/my-performance', label: 'My Performance', icon: '📈' },
    //{ path: '/employee/my-products-performance', label: 'Product Performance', icon: '🏷️' },
    //{ path: '/employee/out-of-stock', label: 'Out of Stock', icon: '⚠️' },
    { path: '/employee/enquiries', label: 'Enquiries', icon: '💬' },
    { path: '/employee/suggestions', label: 'Suggestion', icon: '💡' },
    { path: '/employee/products-sales', label: 'Products on Sale', icon: '🏷️' },
    { path: '/employee/account-profile', label: 'Account Profile', icon: '👤' },
  ];

  return (
    <div className="employee-layout">
      <nav className="employee-navbar">
        <div className="navbar-brand">Aisle-Net Employee</div>
        <div className="navbar-user">
          <span>Employee Name</span>
          <span className="role-badge">Employee</span>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="logout-btn">Logout</button>
        </div>
      </nav>
      
      <div className="employee-container">
        <aside className="employee-sidebar">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        
        <main className="employee-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;