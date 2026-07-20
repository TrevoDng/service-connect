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
