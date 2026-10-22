export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: 'New' | 'Sale' | 'Limited' | 'Bestseller';
  sizes?: string[];
  colors?: string[];
}


