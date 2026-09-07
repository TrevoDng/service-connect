// src/data/demoServices.ts

export interface DemoService {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  price?: string;
  rating?: number;
  providerCount?: number;
  color: string;
}

export const demoServices: DemoService[] = [
  {
    id: '1',
    title: 'Plumbing Services',
    description: 'Expert plumbers for repairs, installations, and maintenance',
    icon: '🔧',
    category: 'Home Repair',
    price: 'From R250',
    rating: 4.8,
    providerCount: 45,
    color: '#4fc3f7'
  },
  {
    id: '2',
    title: 'Electrical Services',
    description: 'Licensed electricians for wiring, repairs, and installations',
    icon: '💡',
    category: 'Home Repair',
    price: 'From R300',
    rating: 4.7,
    providerCount: 38,
    color: '#ffb74d'
  },
  {
    id: '3',
    title: 'Building & Construction',
    description: 'Professional builders for renovations, extensions, and new builds',
    icon: '🏗️',
    category: 'Construction',
    price: 'From R500',
    rating: 4.9,
    providerCount: 52,
    color: '#a1887f'
  },
  {
    id: '4',
    title: 'Garden Services',
    description: 'Garden maintenance, landscaping, and irrigation systems',
    icon: '🌿',
    category: 'Outdoor',
    price: 'From R200',
    rating: 4.6,
    providerCount: 30,
    color: '#81c784'
  },
  {
    id: '5',
    title: 'Renovation Services',
    description: 'Complete home renovation, painting, and interior design',
    icon: '🏠',
    category: 'Construction',
    price: 'From R400',
    rating: 4.8,
    providerCount: 28,
    color: '#ce93d8'
  },
  {
    id: '6',
    title: 'Irrigation Systems',
    description: 'Design and installation of efficient irrigation systems',
    icon: '💧',
    category: 'Outdoor',
    price: 'From R350',
    rating: 4.5,
    providerCount: 18,
    color: '#4dd0e1'
  },
  {
    id: '7',
    title: 'Computer Repair',
    description: 'Hardware repairs, software installation, and IT support',
    icon: '💻',
    category: 'Technology',
    price: 'From R200',
    rating: 4.4,
    providerCount: 25,
    color: '#90a4ae'
  },
  {
    id: '8',
    title: 'Electrical Engineering',
    description: 'Professional electrical engineering for commercial and residential',
    icon: '⚡',
    category: 'Engineering',
    price: 'From R450',
    rating: 4.9,
    providerCount: 15,
    color: '#ff8a65'
  }
];

export const categories = [
  'All',
  'Home Repair',
  'Construction',
  'Outdoor',
  'Technology',
  'Engineering'
];
