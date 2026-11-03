import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { createOrder } from '@/api/account';
import type { OrderResponse } from '@/api/types';
import { useAuth } from '@/features/account/AuthProvider';
import { useCart } from '@/features/cart/CartProvider';
import { fullPhone } from '@/lib/format';
import { readJson, StorageKeys, writeJson } from '@/lib/storage';

export interface ContactDraft {
  name: string;
  phoneDigits: string;
}

export interface PlacedOrder {
  localId: string;
  number: string | null;
  createdAt: number;
  total: number;
  count: number;
  items: { productId: string; name: string; image: string; qty: number; price: number }[];
}

export interface OrderInput extends ContactDraft {
  comment: string;
  latitude: number;
  longitude: number;
}

interface OrdersContextValue {
  orders: PlacedOrder[];
  contact: ContactDraft | null;
  placeOrder: (input: OrderInput) => Promise<PlacedOrder>;
}

const MAX_HISTORY = 50;

const OrdersContext = createContext<OrdersContextValue | null>(null);

const orderNumber = (response: OrderResponse | null) => {
  const value = response?.orderId ?? response?.number ?? response?.id;
  return value === undefined || value === null ? null : String(value);
};

export function OrdersProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const { sessionId, lines, total, count, flush, resetAfterOrder } = useCart();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [contact, setContact] = useState<ContactDraft | null>(null);

  useEffect(() => {
    readJson<PlacedOrder[]>(StorageKeys.orders).then((saved) => saved && setOrders(saved));
    readJson<ContactDraft>(StorageKeys.contact).then((saved) => saved && setContact(saved));
  }, []);

  const placeOrder = useCallback(
    async (input: OrderInput) => {
      if (!sessionId) throw new Error('session');
      await flush();
      const response = await createOrder(
        {
          name: input.name.trim(),
          phone: fullPhone(input.phoneDigits),
          comment: input.comment.trim(),
          lat: input.latitude,
          lng: input.longitude,
          sessionId,
        },
        token,
      );

      const order: PlacedOrder = {
        localId: `${Date.now()}`,
        number: orderNumber(response),
        createdAt: Date.now(),
        total,
        count,
        items: lines.map((line) => ({
          productId: line.productId,
          name: line.product.name,
          image: line.product.image,
          qty: line.qty,
          price: line.product.price,
        })),
      };

      const nextContact = { name: input.name.trim(), phoneDigits: input.phoneDigits };
      setContact(nextContact);
      writeJson(StorageKeys.contact, nextContact);
      setOrders((previous) => {
        const next = [order, ...previous].slice(0, MAX_HISTORY);
        writeJson(StorageKeys.orders, next);
        return next;
      });
      resetAfterOrder();
      return order;
    },
    [sessionId, token, total, count, lines, flush, resetAfterOrder],
  );

  const value = useMemo<OrdersContextValue>(() => ({ orders, contact, placeOrder }), [orders, contact, placeOrder]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used inside OrdersProvider');
  return context;
}
