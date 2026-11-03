import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { fetchBrands, fetchCategories, fetchProducts } from '@/api/catalog';
import type { Brand, Category, Product } from '@/api/types';
import { readJson, StorageKeys, writeJson } from '@/lib/storage';

type CatalogStatus = 'loading' | 'ready' | 'error';

interface CatalogSnapshot {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

interface CatalogContextValue extends CatalogSnapshot {
  status: CatalogStatus;
  refreshing: boolean;
  refresh: () => Promise<void>;
  productById: (id: string) => Product | undefined;
  brandByName: (name: string) => Brand | undefined;
}

const EMPTY: CatalogSnapshot = { products: [], categories: [], brands: [] };

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<CatalogSnapshot>(EMPTY);
  const [status, setStatus] = useState<CatalogStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const hasData = useRef(false);

  const load = useCallback(async () => {
    try {
      const [products, categories, brands] = await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
      const next = { products, categories, brands };
      hasData.current = true;
      setSnapshot(next);
      setStatus('ready');
      writeJson(StorageKeys.catalog, next);
    } catch {
      if (!hasData.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    readJson<CatalogSnapshot>(StorageKeys.catalog).then((cached) => {
      if (cached?.products?.length && !hasData.current) {
        hasData.current = true;
        setSnapshot(cached);
        setStatus('ready');
      }
    });
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (!hasData.current) setStatus('loading');
    await load();
    setRefreshing(false);
  }, [load]);

  const value = useMemo<CatalogContextValue>(() => {
    const productsById = new Map(snapshot.products.map((product) => [product.id, product]));
    const brandsByName = new Map(snapshot.brands.map((brand) => [brand.name, brand]));
    return {
      ...snapshot,
      status,
      refreshing,
      refresh,
      productById: (id) => productsById.get(id),
      brandByName: (name) => brandsByName.get(name),
    };
  }, [snapshot, status, refreshing, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}
