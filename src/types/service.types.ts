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
