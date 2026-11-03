export type CategoryKey =
  | 'protein'
  | 'creatine'
  | 'amino'
  | 'pre-workout'
  | 'weight-gainer'
  | 'fat-burner'
  | 'vitamins'
  | 'health';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryKey;
  country: string;
  price: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  sku: string;
  active: boolean;
}

export interface ProductDetails extends Product {
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  short: string;
  logoBg: string;
  color: string;
  country: string;
}

export interface Category {
  key: CategoryKey;
  image: string;
}

export interface CartLine {
  productId: string;
  qty: number;
  product?: Product;
}

export interface Cart {
  items: CartLine[];
  total: number;
  count: number;
}

export interface User {
  id?: string | number;
  username: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface OrderRequest {
  name: string;
  phone: string;
  comment: string;
  lat: number;
  lng: number;
  sessionId: string;
}

export interface OrderResponse {
  id?: string | number;
  orderId?: string | number;
  number?: string | number;
}

export type ProductSort = 'rating' | 'price_asc' | 'price_desc';
