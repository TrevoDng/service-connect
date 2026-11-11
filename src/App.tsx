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
//import { PageNotFound } from './pagenotfound/pagenotfound';
import { PageNotFound } from './pages/PageNotFound';
import RequestRegistration from './pages/RequestRegistration';
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
import ConsultationUpload from './pages/ConsultationUpload';
import ServiceProviderRegister from './account/components/Auth/provider/ServiceProviderRegister';
import ConsultationPayment from './pages/ConsultationPayment';
import ConsultationOutcomes from './pages/ConsultationOutcomes';
import ProviderProfile from './pages/ProviderProfile';
import WorkSessionGate from './pages/WorkSessionGate';
import AdminLogin from './account/components/Auth/admin/AdminLogin';
import EmailVerification from './account/components/Auth/email-verification/EmailVerification';
import ResendVerification from './account/components/Auth/email-verification/ResendVerification';
import { useSseConnection } from './hooks/useSseConnection';
import { PaymentSuccess } from './pages/PaymentSuccess';

// ============================================
// ROUTE GUARDS
// ============================================

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: Array<'CLIENT' | 'PROVIDER' | 'EMPLOYEE' | 'ADMIN'> 
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingFallback}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // 1. Check if logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if role is allowed (if allowedRoles is provided)
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Redirect them to their correct dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee-dashboard" replace />;
    if (user.role === 'PROVIDER') return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/services" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <>{children}</>;

  // Already logged in — send each role to its own landing page
  if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
  if (user?.role === 'EMPLOYEE') return <Navigate to="/employee-dashboard" replace />;
  if (user?.role === 'PROVIDER') return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === 'CLIENT') return <Navigate to="/services" replace />;

  return <Navigate to="/services" replace />;
};

// Add this inside App.tsx
const ServicesRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'CLIENT') return <Navigate to="/client/dashboard?tab=new" replace />;
  if (user?.role === 'PROVIDER') return <Navigate to="/provider/dashboard?tab=browse-services" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard?tab=browse-services" replace />;
  if (user?.role === 'EMPLOYEE') return <Navigate to="/employee-dashboard?tab=browse-services" replace />;
  
  // Guest users can access the services page directly
  return <ClientServices standalone />;
};

// ============================================
// APP CONTENT
// ============================================

const AppContent: React.FC = () => {

  useSseConnection(); // Initialize SSE connection for notifications
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
          
           <Route path="/services" element={<ServicesRedirect />} />
          <Route path="/services/:id" element={<ServiceDetails />} /> 

          <Route path="/about" element={<About />} 
          />
          <Route path="/providers/:id" element={<ProviderProfile />} />

          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
          <Route path="/apply" element={<PublicRoute><RequestRegistration /></PublicRoute>} />
          <Route path="/service-provider-register" element={<ServiceProviderRegister />} />
          <Route path="/register/employee" element={<PublicRoute><EmployeeRegister /></PublicRoute>} />
          <Route path="/login/employee" element={<PublicRoute><EmployeeLogin /></PublicRoute>} />
          <Route path="/login/admin" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          {/* Protected Booking Flow */}
          <Route 
            path="/bookings/:id/consultation" 
            element={<ProtectedRoute allowedRoles={['CLIENT']}><ConsultationPayment /></ProtectedRoute>} 
          />
          <Route 
            path="/bookings/:id/outcomes" 
            element={<ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER']}><ConsultationOutcomes /></ProtectedRoute>} 
          />

          {/* User Account */}
          <Route 
            path="/account" 
            element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} 
          />

          <Route 
            path="/settings" 
            element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} // Points to account for now
          />
          <Route 
            path="/help" 
            element={<ProtectedRoute><About /></ProtectedRoute>} // Points to About for now
          />

          {/* Dashboards */}
          <Route 
            path="/client/dashboard" 
            element={<ProtectedRoute allowedRoles={['CLIENT']}><ClientDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin-dashboard" 
            element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/employee-dashboard" 
            element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/provider/dashboard" 
            element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/provider/bookings/:id/consultation" 
            element={<ProtectedRoute allowedRoles={['PROVIDER']}><ConsultationUpload /></ProtectedRoute>} 
          />
          <Route 
            path="/provider/bookings/:id/start-work" 
            element={<ProtectedRoute allowedRoles={['PROVIDER']}><WorkSessionGate /></ProtectedRoute>} 
          />

          <Route path="/payment-success" element={<PaymentSuccess />} />

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