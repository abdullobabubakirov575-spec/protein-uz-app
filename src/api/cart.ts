import { request } from './client';
import type { Cart } from './types';

const cartPath = (sessionId: string) => `/api/cart/${encodeURIComponent(sessionId)}`;
const linePath = (sessionId: string, productId: string) =>
  `${cartPath(sessionId)}/${encodeURIComponent(productId)}`;

export function fetchCart(sessionId: string): Promise<Cart> {
  return request<Cart>(cartPath(sessionId));
}

export async function addCartLine(sessionId: string, productId: string, qty: number): Promise<void> {
  await request(cartPath(sessionId), { method: 'POST', body: { productId, qty } });
}

export async function updateCartLine(sessionId: string, productId: string, qty: number): Promise<void> {
  await request(linePath(sessionId, productId), { method: 'PUT', body: { qty } });
}

export async function removeCartLine(sessionId: string, productId: string): Promise<void> {
  await request(linePath(sessionId, productId), { method: 'DELETE' });
}
