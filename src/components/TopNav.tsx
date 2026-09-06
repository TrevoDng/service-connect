// src/components/TopNav.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../account/context/AuthContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  Sun,
  Moon,
  Home,
  PlusCircle,
  List
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const { user, isAuthenticated, logout, isServiceProvider, isClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (isServiceProvider()) {
      return '/provider/dashboard';
    }
    if (isClient()) {
      return '/client/services';
    }
    return '/';
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SkilledFinder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/services" className="text-gray-700 hover:text-blue-600">
              Browse Services
            </Link>
            
            {isAuthenticated && isServiceProvider() && (
              <Link to="/provider/dashboard" className="text-gray-700 hover:text-blue-600">
                My Dashboard
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        Role: {user?.role?.toLowerCase()}
                      </p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {isServiceProvider() && (
                      <>
                        <Link
                          to="/provider/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <List className="h-4 w-4" />
                          My Services
                        </Link>
                        <Link
                          to="/provider/dashboard?tab=add"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add Service
                        </Link>
                      </>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full border-t border-gray-200 mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white p-4">
          <div className="flex flex-col space-y-3">
            <Link
              to="/services"
              className="text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Services
            </Link>
            
            {isAuthenticated && isServiceProvider() && (
              <>
                <Link
                  to="/provider/dashboard"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/provider/dashboard?tab=add"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add Service
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};