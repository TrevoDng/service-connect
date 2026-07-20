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
