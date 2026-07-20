#!/bin/bash

# Create about page
cat > about/About.tsx << 'EOL'
import React from 'react';
import './About.css';

export const About: React.FC = () => {
  return (
    <div className="about">
      <h1>About ServiceConnect</h1>
      <p>Connecting clients with trusted service providers</p>
    </div>
  );
};
EOL

touch about/About.css

# Create account components - Admin
cat > account/components/Admin/AdminDashboard.tsx << 'EOL'
import React from 'react';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage service providers, clients, and platform settings</p>
    </div>
  );
};
EOL

touch account/components/Admin/AdminDashboard.css
touch account/components/Admin/AdminMainPage.tsx
touch account/components/Admin/AdminMainPage.css
touch account/components/Admin/AdminManagement.tsx
touch account/components/Admin/AdminManagement.css
touch account/components/Admin/AdminSetup.tsx
touch account/components/Admin/AdminSetup.css
touch account/components/Admin/AdminAccountProfile.tsx
touch account/components/Admin/AdminAccountProfile.css
touch account/components/Admin/Clients.tsx
touch account/components/Admin/Clients.css
touch account/components/Admin/Employees.tsx
touch account/components/Admin/Employees.css
touch account/components/Admin/EmployeesPerformance.tsx
touch account/components/Admin/EmployeesPerformance.css
touch account/components/Admin/RegistrationRequests.tsx
touch account/components/Admin/RegistrationRequests.css
touch account/components/Admin/RegistrationInviteCode.tsx
touch account/components/Admin/RegistrationInviteCode.css
touch account/components/Admin/AddDiscountModal.tsx
touch account/components/Admin/AddDiscountModal.css

# Create account components - Auth
cat > account/components/Auth/RoleSelector.tsx << 'EOL'
import React from 'react';

interface RoleSelectorProps {
  onSelectRole: (role: 'client' | 'employee' | 'admin') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="role-selector">
      <h2>Select Your Role</h2>
      <button onClick={() => onSelectRole('client')}>Client</button>
      <button onClick={() => onSelectRole('employee')}>Employee</button>
      <button onClick={() => onSelectRole('admin')}>Administrator</button>
    </div>
  );
};
EOL

# Auth - Admin Login
cat > account/components/Auth/admin/AdminLogin.tsx << 'EOL'
import React, { useState, FormEvent } from 'react';
import './AdminLogin.css';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Admin login logic
    console.log('Admin login:', { email, password });
  };

  return (
    <div className="admin-login">
      <h2>Administrator Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login as Admin</button>
      </form>
    </div>
  );
};
EOL
touch account/components/Auth/admin/AdminLogin.css

# Auth - Customer Login & Register
cat > account/components/Auth/customer/CustomerLogin.tsx << 'EOL'
import React, { useState, FormEvent } from 'react';
import './CustomerLogin.css';

export const CustomerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Customer login:', { email, password });
  };

  return (
    <div className="customer-login">
      <h2>Client Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
EOL
touch account/components/Auth/customer/CustomerLogin.css

cat > account/components/Auth/customer/CustomerRegister.tsx << 'EOL'
import React, { useState, FormEvent } from 'react';
import './CustomerRegister.css';

export const CustomerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Customer registration:', formData);
  };

  return (
    <div className="customer-register">
      <h2>Client Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
        <button type="submit">Register as Client</button>
      </form>
    </div>
  );
};
EOL
touch account/components/Auth/customer/CustomerRegister.css

# Auth - Email Verification
cat > account/components/Auth/email-verification/EmailVerification.tsx << 'EOL'
import React, { useState } from 'react';
import './EmailVerification.css';

export const EmailVerification: React.FC = () => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    console.log('Verifying email with code:', code);
  };

  return (
    <div className="email-verification">
      <h2>Verify Your Email</h2>
      <p>Enter the verification code sent to your email</p>
      <input
        type="text"
        placeholder="Verification Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleSubmit}>Verify</button>
    </div>
  );
};
EOL
touch account/components/Auth/email-verification/EmailVerification.css
touch account/components/Auth/email-verification/ResendVerification.tsx
touch account/components/Auth/email-verification/ResendVerification.css

# Auth - Employee Login & Register
cat > account/components/Auth/employee/EmployeeLogin.tsx << 'EOL'
import React, { useState, FormEvent } from 'react';
import './EmployeeLogin.css';

export const EmployeeLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Employee login:', { email, password });
  };

  return (
    <div className="employee-login">
      <h2>Employee Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Employee Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login as Employee</button>
      </form>
    </div>
  );
};
EOL
touch account/components/Auth/employee/EmployeeLogin.css
touch account/components/Auth/employee/EmployeeRegister.tsx
touch account/components/Auth/employee/EmployeeRegister.css

# Create account components - Employee
cat > account/components/Employee/EmployeeDashboard.tsx << 'EOL'
import React from 'react';
import './EmployeeDashboard.css';

export const EmployeeDashboard: React.FC = () => {
  return (
    <div className="employee-dashboard">
      <h1>Employee Dashboard</h1>
      <p>View and manage assigned service requests</p>
    </div>
  );
};
EOL
touch account/components/Employee/EmployeeDashboard.css
touch account/components/Employee/EmployeeMainPage.tsx
touch account/components/Employee/EmployeeMainPage.css
touch account/components/Employee/EmployeeAccountProfile.tsx
touch account/components/Employee/EmployeeAccountProfile.css
touch account/components/Employee/EmployeeEnquiries.tsx
touch account/components/Employee/EmployeeEnquiries.css
touch account/components/Employee/EmployeeSuggestions.tsx
touch account/components/Employee/EmployeeSuggestions.css
touch account/components/Employee/MyPerformance.tsx
touch account/components/Employee/MyPerformance.css

# Create account components - Common
touch account/components/common/ConfirmModal.tsx
touch account/components/common/ConfirmModal.css
touch account/components/common/DashboardCard.tsx
touch account/components/common/DashboardCard.css

# Create account components - Customer
touch account/components/customer/CustomerAccountProfile.tsx
touch account/components/customer/CustomerAccountProfile.css

# Create account components - Layout
touch account/components/layout/AdminLayout.tsx
touch account/components/layout/AdminLayout.css
touch account/components/layout/EmployeeLayout.tsx
touch account/components/layout/EmployeeLayout.css

# Create account context
cat > account/context/AuthContext.tsx << 'EOL'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'employee' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulate login
    setUser({
      id: '1',
      email,
      fullName: 'John Doe',
      role: 'client',
    });
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (data: any) => {
    console.log('Registering:', data);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
EOL

# Create account payments
touch account/payments/Checkout.tsx
touch account/payments/PaymentMethodSelector.tsx
touch account/payments/PaymentMethodSelector.module.css
touch account/payments/PaymentStatus.tsx
touch account/payments/getPaymentMethod.tsx

# Create account types
cat > account/types/user.ts << 'EOL'
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'employee' | 'admin';
  phone?: string;
  createdAt: string;
}

export interface Client extends User {
  role: 'client';
  preferredServices: string[];
}

export interface Employee extends User {
  role: 'employee';
  serviceType: string;
  rating: number;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}
EOL

# Create footer
cat > footer/Footer.tsx << 'EOL'
import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; 2026 ServiceConnect. All rights reserved.</p>
    </footer>
  );
};
EOL
touch footer/Footer.css

# Create hooks
cat > hooks/useAuth.ts << 'EOL'
import { useContext } from 'react';
import { AuthContext } from '../account/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
EOL
touch hooks/useDiscounts.ts
touch hooks/useIdempotency.ts
touch hooks/useImageUpload.ts

# Create nav
cat > nav/Navbar.tsx << 'EOL'
import React from 'react';
import './nav.css';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">ServiceConnect</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
      </ul>
    </nav>
  );
};
EOL
touch nav/TopNavbar.tsx
touch nav/TopNavbar.css
touch nav/nav.css

# Create pagenotfound
cat > pagenotfound/pagenotfound.tsx << 'EOL'
import React from 'react';

export const PageNotFound: React.FC = () => {
  return (
    <div className="page-not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
};
EOL

# Create screen-size
cat > screen-size/useMediaQuery.ts << 'EOL'
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};
EOL

# Create search
touch search/SearchForm.tsx
touch search/SearchProductCard.tsx
touch search/SearchProductCard.css
touch search/SearchProductsGrid.tsx
touch search/SearchProductsGrid.css
touch search/search.css

# Create services
cat > services/api.service.ts << 'EOL'
export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
EOL
touch services/auth.service.ts
touch services/user.service.ts

# Create styles
cat > styles/themes.css << 'EOL'
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #f0f4f8;
  --text-color: #333;
  --white: #ffffff;
}
EOL
touch styles/context/ThemeContext.tsx

# Create types (main types folder)
cat > types/auth.types.ts << 'EOL'
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: 'client' | 'employee' | 'admin';
  phone?: string;
  serviceType?: string;
  companyName?: string;
  registrationNumber?: string;
}
EOL

cat > types/service.types.ts << 'EOL'
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  priceRange?: string;
}

export interface JobRequest {
  id: string;
  clientId: string;
  serviceType: string;
  description: string;
  location: string;
  budget: number;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string;
}
EOL

cat > types/enquiry.ts << 'EOL'
export interface Enquiry {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
EOL

# Create utils
cat > utils/generateId.ts << 'EOL'
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
EOL
touch utils/imageUpload.ts
touch utils/productTypes.ts

echo "✅ Structure created successfully!"
