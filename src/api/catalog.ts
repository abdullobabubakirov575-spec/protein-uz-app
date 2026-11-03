import { request } from './client';
import type { Brand, Category, CategoryKey, Product, ProductDetails } from './types';

const CATALOG_LIMIT = 5000;

export async function fetchProducts(): Promise<Product[]> {
  const data = await request<{ products: Product[] }>(`/api/products?limit=${CATALOG_LIMIT}&sort=rating`);
  return data.products.filter((product) => product.active !== false);
}

export function fetchProduct(id: string): Promise<ProductDetails> {
  return request<ProductDetails>(`/api/products/${encodeURIComponent(id)}`);
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await request<{ categories: Record<string, { image: string }> }>('/api/categories');
  return Object.entries(data.categories).map(([key, value]) => ({
    key: key as CategoryKey,
    image: value.image,
  }));
}

export async function fetchBrands(): Promise<Brand[]> {
  const data = await request<{ brands: Brand[] }>('/api/brands');
  return data.brands;
}
