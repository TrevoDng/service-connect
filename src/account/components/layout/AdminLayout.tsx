// src/components/layout/AdminLayout.tsx
import React, { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../styles/context/ThemeContext';
//@ts-ignore
import './AdminLayout.css';
// import { useSlider } from '../../../slider/slidercontext/SliderContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
    // const { hideSlider} = useSlider();
    //   useEffect(() => {      
    //     hideSlider();    
    //   }, [hideSlider]);


  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/mainpage', label: 'Main Page', icon: '🏠' },
    { path: '/admin/management', label: 'Admin Management', icon: '⚙️' },
    { path: '/admin/setup', label: 'Admin Once Registration', icon: '⚙️' },
    { path: '/admin/registration-requests', label: 'Registration Requests', icon: '👥', badge: 3 },
    { path: '/admin/pending-products', label: 'Pending Products', icon: '⏳', badge: 5 },
    { path: '/admin/clients', label: 'Clients', icon: '👤' },
    { path: '/admin/registration-invite-codes', label: 'Invite Codes', icon: '🎫' },
    { path: '/admin/admins', label: 'Admins', icon: '👑' },
    { path: '/admin/employees', label: 'Employees', icon: '👔' },
    { path: '/admin/employee-performance', label: 'Employee Performance', icon: '📈' },
    { path: '/admin/add-product', label: 'Add Product', icon: '➕' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/products-performance', label: 'Products Performance', icon: '🏷️' },
    { path: '/admin/products-sales', label: 'Products Sales', icon: '💰' },
    { path: '/admin/out-of-stock', label: 'Out of Stock', icon: '⚠️', badge: 2 },
    { path: '/admin/enquiries', label: 'Enquiries', icon: '💬' },
    { path: '/admin/suggestions', label: 'Suggestions', icon: '💡' },
    { path: '/admin/admin-profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="admin-layout">
      <nav className="admin-navbar">
        <div className="navbar-brand">Aisle-Net Admin</div>
        <div className="navbar-user">
          <span>Admin Name</span>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="logout-btn">Logout</button>
        </div>
      </nav>
      
      <div className="admin-container">
        <aside className="admin-sidebar">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  {item.badge && <span className="menu-badge">{item.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;