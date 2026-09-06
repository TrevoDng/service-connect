export interface ProductType {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  createdAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'pending';

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}
