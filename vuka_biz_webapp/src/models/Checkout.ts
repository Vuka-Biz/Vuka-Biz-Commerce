import type { IconName } from '@/components/ui/Icon';

import type { Cart } from './Cart';
import { Money } from './Money';

export type DeliveryOptionId = 'pooled' | 'collect';

export class DeliveryOption {
  constructor(
    readonly id: DeliveryOptionId,
    readonly title: string,
    readonly tag: string,
    readonly detail: string,
    readonly fee: Money,
    readonly summaryLabel: string,
  ) {}

  get feeLabel(): string {
    return this.fee.isZero ? 'Free' : this.fee.format();
  }
}

export type PaymentMethodId = 'card' | 'eft' | 'qr' | 'voucher';

export class PaymentMethod {
  constructor(
    readonly id: PaymentMethodId,
    readonly label: string,
    readonly icon: IconName,
  ) {}
}

/** Price breakdown for a cart + chosen delivery option. */
export class CheckoutQuote {
  static readonly VAT_RATE = 0.15;

  constructor(
    readonly cart: Cart,
    readonly delivery: DeliveryOption,
  ) {}

  get deliveryFee(): Money {
    return this.delivery.fee;
  }

  get total(): Money {
    return this.cart.subtotal.add(this.deliveryFee);
  }

  /** VAT already included in the total. */
  get vatIncluded(): Money {
    const rate = CheckoutQuote.VAT_RATE;
    return Money.of(Math.round((this.total.amount * rate) / (1 + rate)));
  }
}
