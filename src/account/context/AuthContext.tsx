// src/account/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/user';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ 
    requiresEmailVerification?: boolean; 
    requiresAdminApproval?: boolean;
    message: string;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getToken: () => string | null;
  getAllUsers: () => Promise<any>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  // 👇 Add these new helper functions
  isServiceProvider: () => boolean;
  isClient: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to get token from storage
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper to get user from storage
const getStoredUser = (): User | null => {
  const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
};

// Helper to set auth data in storage
const setAuthData = (token: string, user: User, rememberMe: boolean) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  } else {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Helper to clear auth data from storage
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

// Helper to extract data from wrapped or unwrapped response
const extractResponseData = (response: any) => {
  if (response.success === true && response.data) {
    return response.data;
  }
  return response;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // 👇 Define helper functions INSIDE the AuthProvider component
  const isServiceProvider = (): boolean => {
    return user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';
  };

  const isClient = (): boolean => {
    return user?.role === 'CLIENT';
  };

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN';
  };

  // Check authentication status on mount using /auth/me endpoint
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          const responseData = extractResponseData(result);
          const userData = responseData.user || responseData;
          
          if (userData && userData.id) {
            const fullUser: User = {
              id: userData.id,
              firstName: userData.firstName || userData.name?.split(' ')[0] || '',
              lastName: userData.lastName || userData.name?.split(' ')[1] || '',
              email: userData.email,
              avatar: userData.avatar,
              phone: userData.phone,
              role: userData.role,
              status: userData.status,
              emailVerified: userData.emailVerified,
              createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
              lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
              updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            };
            setUser(fullUser);
          } else {
            clearAuthData();
            setUser(null);
          }
        } else {
          clearAuthData();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const responseData = extractResponseData(result);
        const userData = responseData.user || responseData;
        
        if (userData && userData.id) {
          const fullUser: User = {
            id: userData.id,
            firstName: userData.firstName || userData.name?.split(' ')[0] || '',
            lastName: userData.lastName || userData.name?.split(' ')[1] || '',
            email: userData.email,
            avatar: userData.avatar,
            phone: userData.phone,
            role: userData.role,
            status: userData.status,
            emailVerified: userData.emailVerified,
            createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
            lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          };
          setUser(fullUser);
          
          // Update stored user
          const rememberMe = !!localStorage.getItem('token');
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(fullUser));
          } else if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('user', JSON.stringify(fullUser));
          }
        }
      } else if (response.status === 401) {
        clearAuthData();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Admin: Get all users
  const getAllUsers = async () => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || result.error?.message || 'Failed to fetch users');
    }

    const responseData = extractResponseData(result);
    return responseData.users || responseData;
  };

  // Admin: Update user status
  const updateUserStatus = async (userId: string, status: string) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || result.error?.message || 'Failed to update user status');
    }

    return extractResponseData(result);
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || 'Login failed';
        throw new Error(errorMessage);
      }

      const responseData = extractResponseData(result);
      const token = responseData.token;
      const userData = responseData.user;

      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      const fullUser: User = {
        id: userData.id,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ')[1] || '',
        email: userData.email,
        avatar: userData.avatar,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
      };

      setAuthData(token, fullUser, credentials.rememberMe || false);
      setUser(fullUser);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{
    requiresEmailVerification?: boolean;
    requiresAdminApproval?: boolean;
    message: string;
  }> => {
    setIsLoading(true);
    
    try {
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        rememberMe: data.rememberMe || false,
      };
      
      if (data.phone) {
        payload.phone = data.phone;
      }
      
      if (data.secretCode) {
        payload.secretCode = data.secretCode;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || result.error?.message || 'Registration failed';
        throw new Error(errorMessage);
      }

      const responseData = extractResponseData(result);
      
      return {
        requiresEmailVerification: responseData.requiresEmailVerification,
        requiresAdminApproval: responseData.requiresAdminApproval,
        message: result.message || (data.secretCode ? 'Employee registration submitted' : 'Registration successful!'),
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(console.error);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
      setUser(null);
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    getToken,
    getAllUsers,
    updateUserStatus,
    // 👇 Include the helper functions in the context value
    isServiceProvider,
    isClient,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};