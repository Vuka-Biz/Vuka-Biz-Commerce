import { Money } from './Money';
import type { Product } from './Product';

export class CartLine {
  constructor(
    readonly product: Product,
    readonly quantity: number,
  ) {}

  get total(): Money {
    return this.product.price.multiply(this.quantity);
  }

  get weightKg(): number {
    return this.product.weightKg * this.quantity;
  }

  withQuantity(quantity: number): CartLine {
    return new CartLine(this.product, quantity);
  }
}

export type LoadClass = { label: string; vehicle: string };

/**
 * Immutable shopping crate. Every mutation returns a new Cart so it can be
 * stored in an observable store and diffed by reference.
 */
export class Cart {
  /** Vuka Pool discount applied to every pooled order. */
  static readonly POOL_DISCOUNT_RATE = 0.015;

  constructor(readonly lines: readonly CartLine[] = []) {}

  get isEmpty(): boolean {
    return this.lines.length === 0;
  }

  /** Distinct products in the crate ("4 items"). */
  get itemCount(): number {
    return this.lines.length;
  }

  get unitCount(): number {
    return this.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get goodsTotal(): Money {
    return this.lines.reduce((sum, line) => sum.add(line.total), Money.zero);
  }

  get poolDiscount(): Money {
    return Money.of(Math.round(this.goodsTotal.amount * Cart.POOL_DISCOUNT_RATE));
  }

  get subtotal(): Money {
    return this.goodsTotal.subtract(this.poolDiscount);
  }

  get weightKg(): number {
    return Math.round(this.lines.reduce((sum, line) => sum + line.weightKg, 0));
  }

  get loadClass(): LoadClass {
    const kg = this.weightKg;
    if (kg <= 25) return { label: 'Light', vehicle: 'Scooter' };
    if (kg <= 400) return { label: 'Medium', vehicle: 'Bakkie' };
    return { label: 'Heavy', vehicle: '1-Ton Truck' };
  }

  quantityOf(productId: string): number {
    return this.lines.find((line) => line.product.id === productId)?.quantity ?? 0;
  }

  add(product: Product, quantity = 1): Cart {
    const existing = this.quantityOf(product.id);
    return this.setQuantity(product, existing + quantity);
  }

  setQuantity(product: Product, quantity: number): Cart {
    if (quantity <= 0) return this.remove(product.id);
    const exists = this.lines.some((line) => line.product.id === product.id);
    const lines = exists
      ? this.lines.map((line) => (line.product.id === product.id ? line.withQuantity(quantity) : line))
      : [...this.lines, new CartLine(product, quantity)];
    return new Cart(lines);
  }

  remove(productId: string): Cart {
    return new Cart(this.lines.filter((line) => line.product.id !== productId));
  }

  clear(): Cart {
    return new Cart();
  }
}
