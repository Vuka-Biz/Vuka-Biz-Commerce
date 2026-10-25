import type { PaymentMethodId } from './Checkout';

export type ApiOrderStatus = 'placed' | 'delivered' | 'locked';

/** An order as the Vuka Biz API returns it. `handoverPin` is only sent to the owner. */
export type ApiOrder = {
  id: string;
  ownerUid: string;
  ownerName: string;
  lines: { productId: string; name: string; quantity: number; unitPrice: number }[];
  deliveryId: string;
  paymentId: PaymentMethodId;
  goodsTotal: number;
  poolDiscount: number;
  deliveryFee: number;
  total: number;
  handoverPin?: string;
  failedPinAttempts: number;
  status: ApiOrderStatus;
  createdAt: string;
  deliveredAt?: string;
};
