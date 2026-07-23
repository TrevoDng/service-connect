// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './account/context/AuthContext';
import { TopNav } from './components/TopNav'; // Use only ONE TopNav
import { Footer } from './footer/Footer';
import { About } from './about/About';
import { AdminDashboard } from './account/components/Admin/AdminDashboard';
import { EmployeeDashboard } from './account/components/Employee/EmployeeDashboard';
//@ts-ignore
import './App.css';
//@ts-ignore
import './index.css';
import CustomerLogin from './account/components/Auth/customer/CustomerLogin';
import Home from './pages/Home';
import { PageNotFound } from './pagenotfound/pagenotfound';
import CustomerRegister from './account/components/Auth/customer/CustomerRegister';
import AccountProfile from './account/components/customer/CustomerAccountProfile';
import { ServiceDetails } from './pages/ServiceDetails';
import { ClientServices } from './pages/ClientServices';
import { ProviderDashboard } from './components/ServiceProvider/ProviderDashboard';
import { TopNavbar } from './nav/TopNavbar';

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
  return isAuthenticated ? <Navigate to="/account" /> : <>{children}</>;
};

// AppContent - Everything that needs Router context
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="app">
      {/* Use ONLY ONE TopNav - I recommend TopNav since it has more features */}
      <TopNavbar 
      user={isAuthenticated ? user:  undefined}/>
      
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home currentPage={currentPage} setCurrentPage={setCurrentPage} />} />
          <Route path="/services" element={<ClientServices />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/about" element={<About />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/account" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />
          
          {/* Role-based Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/employee-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                <EmployeeDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/provider/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                <ProviderDashboard />
              </RoleProtectedRoute>
            } 
          />
          
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
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </BrowserRouter>
  );
}

export default App;
