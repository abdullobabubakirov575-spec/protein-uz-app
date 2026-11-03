import { request } from './client';
import type { AuthSession, OrderRequest, OrderResponse, User } from './types';

export function login(username: string, password: string): Promise<AuthSession> {
  return request<AuthSession>('/api/auth/login', { method: 'POST', body: { username, password } });
}

export function register(username: string, password: string): Promise<AuthSession> {
  return request<AuthSession>('/api/auth/register', { method: 'POST', body: { username, password } });
}

export async function fetchMe(token: string): Promise<User | null> {
  const data = await request<{ user?: User } & Partial<User>>('/api/auth/me', { token });
  if (data.user) return data.user;
  return data.username ? { id: data.id, username: data.username } : null;
}

export function createOrder(order: OrderRequest, token: string | null): Promise<OrderResponse> {
  return request<OrderResponse>('/api/orders', { method: 'POST', body: order, token });
}
