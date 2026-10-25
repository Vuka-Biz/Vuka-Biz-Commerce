import type { ApiOrder, PaymentMethodId } from '@/models';

import { FirebaseIdentity } from './FirebaseIdentity';

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Typed calls to the Vuka Biz API (src/app/api). Every request carries the user's Firebase ID token. */
export class ApiClient {
  static listOrders(): Promise<{ orders: ApiOrder[] }> {
    return ApiClient.request('GET', '/api/orders');
  }

  static placeOrder(body: {
    lines: { productId: string; quantity: number }[];
    deliveryId: string;
    paymentId: PaymentMethodId;
  }): Promise<{ order: ApiOrder }> {
    return ApiClient.request('POST', '/api/orders', body);
  }

  static confirmHandover(orderId: string, pin: string): Promise<{ order: ApiOrder }> {
    return ApiClient.request('POST', `/api/orders/${encodeURIComponent(orderId)}/handover`, { pin });
  }

  static adminListOrders(): Promise<{ orders: ApiOrder[] }> {
    return ApiClient.request('GET', '/api/admin/orders');
  }

  static unlockOrder(orderId: string): Promise<{ order: ApiOrder }> {
    return ApiClient.request('POST', `/api/admin/orders/${encodeURIComponent(orderId)}/unlock`);
  }

  private static async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const token = await FirebaseIdentity.idToken();
    if (!token) throw new ApiRequestError(401, 'Your session has expired. Log in again.');

    let response: Response;
    try {
      response = await fetch(path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body !== undefined && { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiRequestError(0, 'No connection. Check your data or Wi-Fi and try again.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiRequestError(response.status, data.error ?? 'Something went wrong.');
    return data as T;
  }
}
