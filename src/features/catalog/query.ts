import type { CategoryKey, Product, ProductSort } from '@/api/types';
import { dictionaries } from '@/i18n/dictionaries';

export interface CatalogFilter {
  query?: string;
  category?: CategoryKey | null;
  brand?: string | null;
  sort?: ProductSort;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[ʻʼ'`‘’]/g, '')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

const searchIndex = new WeakMap<Product, string>();

function haystack(product: Product): string {
  const cached = searchIndex.get(product);
  if (cached) return cached;
  const categoryLabels = Object.values(dictionaries).map((d) => d.categories[product.category] ?? '');
  const value = normalize([product.name, product.brand, product.sku, product.category, ...categoryLabels].join(' '));
  searchIndex.set(product, value);
  return value;
}

const comparators: Record<ProductSort, (a: Product, b: Product) => number> = {
  rating: (a, b) => b.rating - a.rating || b.stock - a.stock,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

export function filterProducts(products: Product[], filter: CatalogFilter): Product[] {
  const terms = normalize(filter.query ?? '').split(' ').filter(Boolean);
  const result = products.filter((product) => {
    if (filter.category && product.category !== filter.category) return false;
    if (filter.brand && product.brand !== filter.brand) return false;
    if (terms.length === 0) return true;
    const text = haystack(product);
    return terms.every((term) => text.includes(term));
  });
  return result.sort(comparators[filter.sort ?? 'rating']);
}

export function similarProducts(products: Product[], product: Product, limit = 10): Product[] {
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .sort((a, b) => Number(b.brand === product.brand) - Number(a.brand === product.brand) || b.rating - a.rating)
    .slice(0, limit);
}
