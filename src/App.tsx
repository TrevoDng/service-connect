import React from 'react';
import { AuthProvider } from './account/context/AuthContext';
import { Navbar } from './nav/Navbar';
import { Footer } from './footer/Footer';
import { About } from './about/About';
import { AdminDashboard } from './account/components/Admin/AdminDashboard';
import { EmployeeDashboard } from './account/components/Employee/EmployeeDashboard';
import { CustomerLogin } from './account/components/Auth/customer/CustomerLogin';
import './App.css';
import './index.css';

function App() {
  // Simple routing demo - you can replace with React Router later
  const [currentPage, setCurrentPage] = React.useState('home');

  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          {currentPage === 'home' && (
            <div className="home-page">
              <header className="hero">
                <div className="hero-content">
                  <h1>ServiceConnect</h1>
                  <p className="tagline">
                    Find trusted professionals for your home services<br />
                    or grow your business by connecting with clients
                  </p>
                  <div className="auth-buttons">
                    <button className="cta-button">Hire / Get Hired</button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('admin')}>
                      Admin Dashboard
                    </button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('employee')}>
                      Employee Dashboard
                    </button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('login')}>
                      Client Login
                    </button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('about')}>
                      About
                    </button>
                  </div>
                </div>
              </header>
            </div>
          )}
          {currentPage === 'about' && <About />}
          {currentPage === 'admin' && <AdminDashboard />}
          {currentPage === 'employee' && <EmployeeDashboard />}
          {currentPage === 'login' && <CustomerLogin />}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
