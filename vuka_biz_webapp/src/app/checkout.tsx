import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import { CheckoutQuote, type DeliveryOption, type PaymentMethodId } from '@/models';
import { CartStore } from '@/services/CartStore';
import { OrderStore } from '@/services/OrderStore';
import { useStore } from '@/services/ObservableStore';
import { Palette, Spacing } from '@/theme/tokens';

type Status = 'idle' | 'placing' | 'confirmed';

export default function CheckoutScreen() {
  const { cart } = useStore(CartStore.instance);
  const [delivery, setDelivery] = useState<DeliveryOption>(MockDatabase.deliveryOptions[0]);
  const [payment, setPayment] = useState<PaymentMethodId>('eft');
  const [status, setStatus] = useState<Status>('idle');
  const toast = useRef<Toast>(null);

  const quote = new CheckoutQuote(cart, delivery);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const placeOrder = async () => {
    setStatus('placing');
    try {
      await OrderStore.instance.place(quote, payment);
      setStatus('confirmed');
    } catch (error) {
      setStatus('idle');
      toast.current?.show((error as Error).message, 'warning');
    }
  };

  const trackOrder = () => {
    CartStore.instance.clear();
    router.replace('/orders');
  };

  const header = {
    title: 'Checkout & Delivery',
    onBack: goBack,
    actions: [{ icon: 'help' as const, label: 'Help', onPress: () => toast.current?.show('Call 0800 8852 249 for checkout help', 'call') }],
  };

  if (cart.isEmpty && status !== 'confirmed') {
    return (
      <UI.Screen header={header}>
        <UI.Card tone="muted" style={styles.empty}>
          <UI.Icon name="shopping_cart" size={40} color={Palette.outline} />
          <UI.Text variant="headlineSm">Your crate is empty</UI.Text>
          <UI.Text color="textMuted" align="center">
            Add wholesale stock from the marketplace to get a pooled delivery quote.
          </UI.Text>
          <UI.Button label="Back to Shop" icon="storefront" variant="brand" onPress={goBack} />
        </UI.Card>
      </UI.Screen>
    );
  }

  const footer =
    status === 'confirmed' ? (
      <UI.Stack gap="sm">
        <UI.Row gap="sm" justify="center">
          <UI.Icon name="verified" size={20} color={Palette.accent} />
          <UI.Text variant="bodyStrong" color="accent">
            Order confirmed! Your handover PIN is on the Orders tab.
          </UI.Text>
        </UI.Row>
        <UI.Button label="Track my order" icon="local_shipping" size="lg" onPress={trackOrder} fullWidth />
      </UI.Stack>
    ) : (
      <UI.Stack gap="xs">
        <UI.Button
          label={status === 'placing' ? 'Securing escrow PIN…' : `Place Order • ${quote.total.format()}`}
          icon="lock"
          size="lg"
          variant="brand"
          loading={status === 'placing'}
          onPress={placeOrder}
          fullWidth
        />
        <UI.Row gap="xxs" justify="center">
          <UI.Icon name="verified" size={14} color={Palette.outline} />
          <UI.Text variant="bodySm" color="outline">
            Encrypted 256-bit • SABRIC & SARB compliant channel
          </UI.Text>
        </UI.Row>
      </UI.Stack>
    );

  return (
    <UI.Screen header={header} footer={footer} overlay={<UI.Toast ref={toast} bottomOffset={140} />}>
      <Vuka.EscrowBanner
        title="Impelo Pay Escrow"
        status="Active"
        body="Funds are released only after you inspect the stock & enter your delivery PIN."
      />

      <Vuka.OrderSummaryCard cart={cart} manifest="#VK-882" />
      <Vuka.LoadCard cart={cart} />

      <UI.SectionHeader title="Fulfilment Method" icon="local_shipping" />
      {MockDatabase.deliveryOptions.map((option) => (
        <Vuka.DeliveryOptionCard
          key={option.id}
          option={option}
          selected={option.id === delivery.id}
          onSelect={setDelivery}
        />
      ))}
      <UI.Row gap="xs" align="flex-start">
        <UI.Icon name="local_gas_station" size={16} color={Palette.textMuted} />
        <UI.Text variant="bodySm" color="textMuted" style={{ flex: 1 }}>
          Delivery price follows the official fuel price (Oct 2026 index). No surprise rate surges.
        </UI.Text>
      </UI.Row>

      <UI.SectionHeader
        title="Payment Method"
        icon="account_balance_wallet"
        trailing={<UI.Badge label="Escrow Lock" icon="lock" tone="accent" />}
      />
      <Vuka.PaymentMethodGrid methods={MockDatabase.paymentMethods} selected={payment} onSelect={setPayment} />
      <UI.Row gap="xs" align="flex-start">
        <UI.Icon name="lock" size={16} color={Palette.textMuted} />
        <UI.Text variant="bodySm" color="textMuted" style={{ flex: 1 }}>
          Supports all major SA banks (Capitec, Standard Bank, FNB, Nedbank, Absa, TymeBank).
        </UI.Text>
      </UI.Row>

      <Vuka.PriceBreakdown quote={quote} />
    </UI.Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: Spacing.gutter, paddingVertical: Spacing.xl },
});
