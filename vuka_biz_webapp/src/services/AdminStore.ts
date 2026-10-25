import type { ApiOrder } from '@/models';

import { ApiClient } from './ApiClient';
import { AuthStore } from './AuthStore';
import { ObservableStore } from './ObservableStore';

type AdminState = { orders: readonly ApiOrder[]; loaded: boolean; error: string | null; updatedAt: number | null };

const EMPTY: AdminState = { orders: [], loaded: false, error: null, updatedAt: null };

/** Every order across all shops, for the support console. Polls while a support user is signed in. */
export class AdminStore extends ObservableStore<AdminState> {
  /** Declared before `instance`: the constructor may start polling straight away. */
  static readonly POLL_MS = 5000;

  static readonly instance = new AdminStore();

  private timer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    super(EMPTY);
    const sync = () => (AuthStore.instance.getSnapshot().user?.role === 'admin' ? this.start() : this.stop());
    AuthStore.instance.subscribe(sync);
    sync();
  }

  async refresh(): Promise<void> {
    try {
      const { orders } = await ApiClient.adminListOrders();
      if (AuthStore.instance.getSnapshot().user?.role !== 'admin') return;
      this.setState({ orders, loaded: true, error: null, updatedAt: Date.now() });
    } catch (error) {
      this.setState({ loaded: true, error: (error as Error).message });
    }
  }

  /** Returns an error message, or null on success. */
  async unlock(orderId: string): Promise<string | null> {
    try {
      const { order } = await ApiClient.unlockOrder(orderId);
      this.setState({ orders: this.getSnapshot().orders.map((o) => (o.id === order.id ? order : o)) });
      return null;
    } catch (error) {
      return (error as Error).message;
    }
  }

  private start(): void {
    if (this.timer) return;
    void this.refresh();
    this.timer = setInterval(() => void this.refresh(), AdminStore.POLL_MS);
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.getSnapshot() !== EMPTY) this.setState(EMPTY);
  }
}
