import { MockDatabase } from '@/data/MockDatabase';
import { type ApiOrder, type CargoBatch, type CheckoutQuote, type CreditScore, type LedgerSummary, Money, type Order, type PaymentMethodId } from '@/models';

import { ApiClient, ApiRequestError } from './ApiClient';
import { AuthStore } from './AuthStore';
import { ObservableStore } from './ObservableStore';

type OrderState = {
  /** Owner: their orders, newest first. Driver: open deliveries. */
  orders: readonly ApiOrder[];
  /** Driver: drops confirmed this shift (they leave the open list on the server). */
  deliveredThisShift: readonly ApiOrder[];
  loaded: boolean;
  error: string | null;
  /** Last refresh time; tracking views derive their dispatch step from it. */
  now: number;
};

const EMPTY: OrderState = { orders: [], deliveredThisShift: [], loaded: false, error: null, now: Date.now() };

/**
 * Orders from the Vuka Biz API, refreshed every few seconds while signed in so
 * the owner's and driver's phones stay in step.
 */
export class OrderStore extends ObservableStore<OrderState> {
  /** Declared before `instance`: the constructor may start polling straight away. */
  static readonly POLL_MS = 5000;

  static readonly instance = new OrderStore();

  private timer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    super(EMPTY);
    const sync = () => (AuthStore.instance.getSnapshot().user ? this.start() : this.stop());
    AuthStore.instance.subscribe(sync);
    // Screens import this lazily, possibly after sign-in already happened.
    sync();
  }

  /* ---------- Views ---------- */

  static trackedOrders(state: OrderState): Order[] {
    return state.orders.map((o) => MockDatabase.orderFromApi(o, state.now));
  }

  static ledger(orders: readonly ApiOrder[]): LedgerSummary {
    return orders.reduce((ledger, o) => ledger.recordPurchase(Money.of(o.total)), MockDatabase.ledger);
  }

  static creditScore(orders: readonly ApiOrder[]): CreditScore {
    return orders.filter((o) => o.status === 'delivered').reduce((score) => score.recordVerifiedTrade(), MockDatabase.creditScore);
  }

  static cargoBatch(state: OrderState): CargoBatch {
    return MockDatabase.cargoBatch(state.deliveredThisShift, state.orders);
  }

  /* ---------- Actions ---------- */

  async refresh(): Promise<void> {
    try {
      const { orders } = await ApiClient.listOrders();
      if (!AuthStore.instance.getSnapshot().user) return;
      const done = new Set(this.getSnapshot().deliveredThisShift.map((o) => o.id));
      this.setState({ orders: orders.filter((o) => !done.has(o.id)), loaded: true, error: null, now: Date.now() });
    } catch (error) {
      this.setState({ loaded: true, error: (error as Error).message, now: Date.now() });
    }
  }

  /** Sends the crate to the API, which prices it, stores it and issues the handover PIN. */
  async place(quote: CheckoutQuote, paymentId: PaymentMethodId): Promise<ApiOrder> {
    const { order } = await ApiClient.placeOrder({
      lines: quote.cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      deliveryId: quote.delivery.id,
      paymentId,
    });
    this.setState({ orders: [order, ...this.getSnapshot().orders], now: Date.now() });
    return order;
  }

  /** Driver side. Returns an error message, or null when the API accepted the PIN. */
  async confirmHandover(orderId: string, pin: string): Promise<string | null> {
    try {
      const { order } = await ApiClient.confirmHandover(orderId, pin);
      const state = this.getSnapshot();
      this.setState({
        orders: state.orders.filter((o) => o.id !== orderId),
        deliveredThisShift: [...state.deliveredThisShift, order],
      });
      return null;
    } catch (error) {
      if (error instanceof ApiRequestError && (error.status === 409 || error.status === 423)) void this.refresh();
      return (error as Error).message;
    }
  }

  private start(): void {
    if (this.timer) return;
    void this.refresh();
    this.timer = setInterval(() => void this.refresh(), OrderStore.POLL_MS);
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.getSnapshot() !== EMPTY) this.setState(EMPTY);
  }
}
