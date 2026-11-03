import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { addCartLine, fetchCart, removeCartLine, updateCartLine } from '@/api/cart';
import type { CartLine, Product } from '@/api/types';
import { useCatalog } from '@/features/catalog/CatalogProvider';
import { readJson, StorageKeys, writeJson } from '@/lib/storage';

export interface ResolvedCartLine {
  productId: string;
  qty: number;
  product: Product;
}

interface CartContextValue {
  sessionId: string | null;
  lines: ResolvedCartLine[];
  count: number;
  total: number;
  syncing: boolean;
  quantityOf: (productId: string) => number;
  add: (product: Product, qty?: number) => boolean;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  refresh: () => Promise<void>;
  flush: () => Promise<void>;
  resetAfterOrder: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const createSessionId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function CartProvider({ children }: PropsWithChildren) {
  const { productById } = useCatalog();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [syncing, setSyncing] = useState(false);
  const linesRef = useRef<CartLine[]>([]);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef(0);

  const commit = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
  }, []);

  useEffect(() => {
    readJson<string>(StorageKeys.sessionId).then((saved) => {
      const id = saved ?? createSessionId();
      if (!saved) writeJson(StorageKeys.sessionId, id);
      setSessionId(id);
    });
  }, []);

  const pull = useCallback(
    async (id: string) => {
      try {
        const cart = await fetchCart(id);
        if (pending.current === 0) commit(cart.items ?? []);
      } catch {}
    },
    [commit],
  );

  useEffect(() => {
    if (sessionId) pull(sessionId);
  }, [sessionId, pull]);

  const enqueue = useCallback(
    (operation: (id: string) => Promise<void>) => {
      if (!sessionId) return;
      pending.current += 1;
      setSyncing(true);
      queue.current = queue.current
        .then(() => operation(sessionId))
        .catch(() => {})
        .finally(() => {
          pending.current -= 1;
          if (pending.current === 0) {
            setSyncing(false);
            pull(sessionId);
          }
        });
    },
    [sessionId, pull],
  );

  const quantityOf = useCallback(
    (productId: string) => lines.find((line) => line.productId === productId)?.qty ?? 0,
    [lines],
  );

  const add = useCallback(
    (product: Product, qty = 1) => {
      const current = linesRef.current;
      const existing = current.find((line) => line.productId === product.id);
      const currentQty = existing?.qty ?? 0;
      const limit = product.stock > 0 ? product.stock : Number.POSITIVE_INFINITY;
      const delta = Math.min(qty, limit - currentQty);
      if (delta <= 0) return false;

      const next = existing
        ? current.map((line) => (line.productId === product.id ? { ...line, qty: currentQty + delta } : line))
        : [...current, { productId: product.id, qty: delta, product }];
      commit(next);
      enqueue((id) => addCartLine(id, product.id, delta));
      return true;
    },
    [commit, enqueue],
  );

  const remove = useCallback(
    (productId: string) => {
      commit(linesRef.current.filter((line) => line.productId !== productId));
      enqueue((id) => removeCartLine(id, productId));
    },
    [commit, enqueue],
  );

  const setQuantity = useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        remove(productId);
        return;
      }
      commit(linesRef.current.map((line) => (line.productId === productId ? { ...line, qty } : line)));
      enqueue((id) => updateCartLine(id, productId, qty));
    },
    [commit, enqueue, remove],
  );

  const refresh = useCallback(async () => {
    if (sessionId) await pull(sessionId);
  }, [sessionId, pull]);

  const flush = useCallback(() => queue.current, []);

  const resetAfterOrder = useCallback(() => {
    commit([]);
    if (sessionId) pull(sessionId);
  }, [commit, sessionId, pull]);

  const value = useMemo<CartContextValue>(() => {
    const resolved: ResolvedCartLine[] = [];
    for (const line of lines) {
      const product = line.product ?? productById(line.productId);
      if (product) resolved.push({ productId: line.productId, qty: line.qty, product });
    }
    return {
      sessionId,
      lines: resolved,
      count: resolved.reduce((sum, line) => sum + line.qty, 0),
      total: resolved.reduce((sum, line) => sum + line.qty * line.product.price, 0),
      syncing,
      quantityOf,
      add,
      setQuantity,
      remove,
      refresh,
      flush,
      resetAfterOrder,
    };
  }, [lines, productById, sessionId, syncing, quantityOf, add, setQuantity, remove, refresh, flush, resetAfterOrder]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
