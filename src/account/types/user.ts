// src/account/types/user.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  updatedAt?: Date;
  // Server provides these - frontend just receives them
  role?: string;
  status?: string;
  emailVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  rememberMe?: boolean;
  secretCode?: string; // If provided, server registers as employee
}

export interface EmployeeRegisterData {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AdminLoginCredentials extends LoginCredentials {}
