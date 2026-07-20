import React, { useState, ChangeEvent, FormEvent } from 'react';
import './App.css';

interface FormData {
  email: string;
  password: string;
  fullName: string;
  role: 'client' | 'provider';
  serviceType: string;
  companyName: string;
  registrationNumber: string;
  companyFile: File | null;
}

function App() {
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    role: 'client',
    serviceType: '',
    companyName: '',
    registrationNumber: '',
    companyFile: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'file' && files ? files[0] : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showRegister) {
      alert('Registration submitted! Waiting for approval.');
    } else {
      alert('Login successful! (Demo)');
    }
  };

  return (
    <div className="app">
      {/* HERO SECTION */}
      <header className="hero">
        <div className="hero-content">
          <h1>ServiceConnect</h1>
          <p className="tagline">
            Find trusted professionals for your home services<br />
            or grow your business by connecting with clients
          </p>
          <button 
            className="cta-button"
            onClick={() => setShowAuth(true)}
          >
            Hire / Get Hired
          </button>
        </div>
        
        <div className="features">
          <div className="feature-card">
            <span className="icon">🔧</span>
            <h3>Plumbing</h3>
            <p>Expert plumbers for any job</p>
          </div>
          <div className="feature-card">
            <span className="icon">⚡</span>
            <h3>Electrical</h3>
            <p>Licensed electricians</p>
          </div>
          <div className="feature-card">
            <span className="icon">🏠</span>
            <h3>Handyman</h3>
            <p>General home repairs</p>
          </div>
          <div className="feature-card">
            <span className="icon">🧹</span>
            <h3>Cleaning</h3>
            <p>Professional cleaning services</p>
          </div>
        </div>
      </header>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuth(false)}>✕</button>
            
            {!showRegister ? (
              // LOGIN FORM
              <div>
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button type="submit" className="submit-btn">Login</button>
                </form>
                <p className="toggle-auth">
                  Don't have an account?{' '}
                  <span onClick={() => setShowRegister(true)}>Register</span>
                </p>
              </div>
            ) : (
              // REGISTRATION FORM
              <div>
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="client">Register as Client</option>
                    <option value="provider">Register as Service Provider</option>
                  </select>

                  {formData.role === 'provider' && (
                    <div className="provider-fields">
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Service Type</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="handyman">Handyman</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="hvac">HVAC</option>
                        <option value="painting">Painting</option>
                      </select>
                      
                      <input
                        type="text"
                        name="companyName"
                        placeholder="Company Name"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                      
                      <input
                        type="text"
                        name="registrationNumber"
                        placeholder="Company Registration Number"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        required
                      />
                      
                      <div className="file-upload">
                        <label>Upload Company Documents</label>
                        <input
                          type="file"
                          name="companyFile"
                          onChange={handleInputChange}
                          accept=".pdf,.doc,.docx"
                          required
                        />
                        <small>PDF or Word documents accepted</small>
                      </div>
                      
                      <p className="approval-note">
                        ⏳ Your registration will be reviewed and approved within 24-48 hours.
                      </p>
                    </div>
                  )}

                  <button type="submit" className="submit-btn">
                    {formData.role === 'provider' ? 'Submit for Approval' : 'Register'}
                  </button>
                </form>
                <p className="toggle-auth">
                  Already have an account?{' '}
                  <span onClick={() => setShowRegister(false)}>Login</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
