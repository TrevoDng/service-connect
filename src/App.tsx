// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './account/context/AuthContext';
import { NotificationProvider } from './account/context/NotificationContext';
import { Footer } from './footer/Footer';
import { About } from './about/About';
import AdminDashboard from './account/components/Admin/AdminDashboard';
import { EmployeeDashboard } from './account/components/Employee/EmployeeDashboard';
import styles from './App.module.scss';
import CustomerLogin from './account/components/Auth/customer/CustomerLogin';
import Home from './pages/Home';
import { PageNotFound } from './pagenotfound/pagenotfound';
import CustomerRegister from './account/components/Auth/customer/CustomerRegister';
import AccountProfile from './account/components/customer/CustomerAccountProfile';
import { ServiceDetails } from './pages/ServiceDetails';
import { ClientServices } from './pages/ClientServices';
import { ProviderDashboard } from './components/ServiceProvider/ProviderDashboard';
import { TopNavbar } from './nav/TopNavbar';
import EmployeeRegister from './account/components/Auth/employee/EmployeeRegister';
import EmployeeLogin from './account/components/Auth/employee/EmployeeLogin';
import { ThemeProvider, useTheme } from './styles/context/ThemeContext';
import { ClientDashboard } from './account/components/Client/ClientDashboard';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600">loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Role-based protected route
const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'EMPLOYEE' | 'CLIENT')[];
  currentPage?: string;
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600">loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user || !allowedRoles.includes(user.role as 'ADMIN' | 'EMPLOYEE' | 'CLIENT')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Public route component (redirects if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/services" /> : <>{children}</>;
};

// AppContent - Everything that needs Router context
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className={`${styles.app} ${theme}-theme`}>
      <TopNavbar
        user={isAuthenticated ? user : undefined}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className={styles.mainContent}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home currentPage={currentPage} setCurrentPage={setCurrentPage} />} />
          <Route path="/services" element={<ClientServices />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/about" element={<About />} />

          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
          <Route path="/service-provider-register" element={<PublicRoute><EmployeeRegister /></PublicRoute>} />
          <Route path="/login/employee" element={<PublicRoute><EmployeeLogin /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/account" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />

          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />

          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router basename={'/service-connect'}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
