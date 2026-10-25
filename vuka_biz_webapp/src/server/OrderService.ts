import { MockDatabase } from '@/data/MockDatabase';
import { type ApiAuditEntry, type ApiOrder, Cart, CheckoutQuote, type PaymentMethodId } from '@/models';

import type { AuthUser } from './FirebaseAuth';
import { ServerConfig } from './config';
import { ApiError } from './http';

/** What the API stores for an order. Prices are always computed here, never taken from the client. */
export type OrderRecord = ApiOrder & { handoverPin: string };

/** Storage behind the service. In-memory now; a Firestore implementation replaces it. */
export interface OrderRepository {
  create(order: OrderRecord): Promise<void>;
  get(id: string): Promise<OrderRecord | undefined>;
  listByOwner(ownerUid: string): Promise<OrderRecord[]>;
  listOpen(): Promise<OrderRecord[]>;
  /** Newest first, capped. Support console only. */
  listAll(limit: number): Promise<OrderRecord[]>;
  update(order: OrderRecord): Promise<void>;
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, OrderRecord>();

  async create(order: OrderRecord) {
    this.orders.set(order.id, structuredClone(order));
  }

  async get(id: string) {
    const order = this.orders.get(id);
    return order && structuredClone(order);
  }

  async listByOwner(ownerUid: string) {
    return [...this.orders.values()].filter((o) => o.ownerUid === ownerUid).map((o) => structuredClone(o));
  }

  async listOpen() {
    return [...this.orders.values()].filter((o) => o.status === 'placed').map((o) => structuredClone(o));
  }

  async listAll(limit: number) {
    return [...this.orders.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((o) => structuredClone(o));
  }

  async update(order: OrderRecord) {
    this.orders.set(order.id, structuredClone(order));
  }
}

const MAX_LINES = 30;
const MAX_QUANTITY = 99;
const PAYMENT_IDS = new Set<string>(MockDatabase.paymentMethods.map((m) => m.id));

function randomDigits(count: number): string {
  const values = crypto.getRandomValues(new Uint32Array(count));
  return Array.from(values, (v) => (v % 10).toString()).join('');
}

/** Compares in time independent of where the strings differ. */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type PlaceOrderInput = {
  lines: { productId: string; quantity: number }[];
  deliveryId: string;
  paymentId: PaymentMethodId;
};

export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  /** Validates an untrusted request body. Unknown fields are ignored; prices are never read. */
  static parsePlaceOrder(body: unknown): PlaceOrderInput {
    if (!isRecord(body)) throw new ApiError(400, 'Body must be a JSON object.');
    const { lines, deliveryId, paymentId } = body;

    if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) {
      throw new ApiError(400, `lines must list 1–${MAX_LINES} products.`);
    }
    const seen = new Set<string>();
    const parsed = lines.map((line, i) => {
      if (!isRecord(line)) throw new ApiError(400, `lines[${i}] must be an object.`);
      const { productId, quantity } = line;
      if (typeof productId !== 'string' || !MockDatabase.products.some((p) => p.id === productId)) {
        throw new ApiError(400, `lines[${i}].productId is not a known product.`);
      }
      if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > MAX_QUANTITY) {
        throw new ApiError(400, `lines[${i}].quantity must be a whole number from 1 to ${MAX_QUANTITY}.`);
      }
      if (seen.has(productId)) throw new ApiError(400, `lines[${i}] repeats ${productId}.`);
      seen.add(productId);
      return { productId, quantity: quantity as number };
    });

    if (typeof deliveryId !== 'string' || !MockDatabase.deliveryOptions.some((d) => d.id === deliveryId)) {
      throw new ApiError(400, 'deliveryId is not a known delivery option.');
    }
    if (typeof paymentId !== 'string' || !PAYMENT_IDS.has(paymentId)) {
      throw new ApiError(400, 'paymentId is not a known payment method.');
    }
    return { lines: parsed, deliveryId, paymentId: paymentId as PaymentMethodId };
  }

  static parsePin(body: unknown): string {
    const pin = isRecord(body) ? body.pin : undefined;
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) throw new ApiError(400, 'pin must be 4 digits.');
    return pin;
  }

  async place(user: AuthUser, input: PlaceOrderInput): Promise<OrderRecord> {
    if (user.role !== 'owner') throw new ApiError(403, 'Only spaza owners can place orders.');

    const cart = input.lines.reduce((c, line) => c.add(MockDatabase.product(line.productId), line.quantity), new Cart());
    const delivery = MockDatabase.deliveryOptions.find((d) => d.id === input.deliveryId)!;
    const quote = new CheckoutQuote(cart, delivery);

    const order: OrderRecord = {
      id: `VB-${randomDigits(6)}`,
      ownerUid: user.uid,
      ownerName: user.name ?? 'Spaza owner',
      lines: cart.lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        quantity: l.quantity,
        unitPrice: l.product.price.amount,
      })),
      deliveryId: delivery.id,
      paymentId: input.paymentId,
      goodsTotal: cart.goodsTotal.amount,
      poolDiscount: cart.poolDiscount.amount,
      deliveryFee: quote.deliveryFee.amount,
      total: quote.total.amount,
      handoverPin: randomDigits(4),
      failedPinAttempts: 0,
      status: 'placed',
      createdAt: new Date().toISOString(),
      audit: [{ at: new Date().toISOString(), by: user.uid, action: 'placed' }],
    };
    await this.repository.create(order);
    return order;
  }

  /** Owners see their own orders with PINs; drivers see open deliveries without them. */
  async list(user: AuthUser): Promise<ApiOrder[]> {
    if (user.role === 'owner') return this.repository.listByOwner(user.uid);
    return (await this.repository.listOpen()).map(OrderService.withoutPin);
  }

  /** Driver enters the PIN the owner reads out. Locks the order after too many wrong tries. */
  async confirmHandover(user: AuthUser, id: string, pin: string): Promise<ApiOrder> {
    if (user.role !== 'driver') throw new ApiError(403, 'Only drivers can confirm a handover.');
    const order = await this.repository.get(id);
    if (!order) throw new ApiError(404, 'Order not found.');
    if (order.status === 'delivered') throw new ApiError(409, 'Order is already delivered.');
    if (order.status === 'locked') throw new ApiError(423, 'Order is locked after too many wrong PINs. Call support.');

    if (!constantTimeEquals(pin, order.handoverPin)) {
      order.failedPinAttempts += 1;
      OrderService.log(order, user, 'wrong_pin');
      if (order.failedPinAttempts >= ServerConfig.maxPinAttempts) {
        order.status = 'locked';
        OrderService.log(order, user, 'locked');
      }
      await this.repository.update(order);
      const left = ServerConfig.maxPinAttempts - order.failedPinAttempts;
      throw left > 0
        ? new ApiError(400, `PIN does not match. ${left} attempt${left === 1 ? '' : 's'} left.`)
        : new ApiError(423, 'Order is locked after too many wrong PINs. Call support.');
    }

    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    OrderService.log(order, user, 'delivered');
    await this.repository.update(order);
    return OrderService.withoutPin(order);
  }

  /** Support console: every order, newest first. PINs are never shown, even to staff. */
  async listAll(user: AuthUser): Promise<ApiOrder[]> {
    if (user.role !== 'admin') throw new ApiError(403, 'Support staff only.');
    return (await this.repository.listAll(200)).map(OrderService.withoutPin);
  }

  /**
   * Support verified the delivery with the shop (e.g. by phone): reopen a locked
   * order with a fresh PIN, since the old one may have been partly guessed.
   */
  async unlock(user: AuthUser, id: string): Promise<ApiOrder> {
    if (user.role !== 'admin') throw new ApiError(403, 'Support staff only.');
    const order = await this.repository.get(id);
    if (!order) throw new ApiError(404, 'Order not found.');
    if (order.status !== 'locked') throw new ApiError(409, 'Only locked orders can be unlocked.');

    order.status = 'placed';
    order.failedPinAttempts = 0;
    order.handoverPin = randomDigits(4);
    OrderService.log(order, user, 'unlocked');
    await this.repository.update(order);
    return OrderService.withoutPin(order);
  }

  private static log(order: OrderRecord, user: AuthUser, action: ApiAuditEntry['action']): void {
    // Older records may predate the audit trail.
    order.audit = [...(order.audit ?? []), { at: new Date().toISOString(), by: user.uid, action }];
  }

  private static withoutPin(order: OrderRecord): ApiOrder {
    const { handoverPin: _, ...rest } = order;
    return rest;
  }
}
