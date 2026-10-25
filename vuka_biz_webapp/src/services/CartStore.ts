import { MockDatabase } from '@/data/MockDatabase';
import type { Cart, Product } from '@/models';

import { ObservableStore } from './ObservableStore';

type CartState = { cart: Cart };

/** The spaza owner's wholesale crate, shared by Shop and Checkout. */
export class CartStore extends ObservableStore<CartState> {
  static readonly instance = new CartStore();

  private constructor() {
    super({ cart: MockDatabase.starterCart() });
  }

  private get cart(): Cart {
    return this.getSnapshot().cart;
  }

  add(product: Product, quantity = 1): void {
    this.setState({ cart: this.cart.add(product, quantity) });
  }

  setQuantity(product: Product, quantity: number): void {
    this.setState({ cart: this.cart.setQuantity(product, quantity) });
  }

  clear(): void {
    this.setState({ cart: this.cart.clear() });
  }
}
