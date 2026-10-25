import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import { AuthStore } from '@/services/AuthStore';
import { ContactService } from '@/services/ContactService';
import { useStore } from '@/services/ObservableStore';
import { OrderStore } from '@/services/OrderStore';
import { Palette, Spacing } from '@/theme/tokens';

export default function OrdersScreen() {
  const { user } = useStore(AuthStore.instance);
  const state = useStore(OrderStore.instance);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  const orders = OrderStore.trackedOrders(state);
  // Follow the newest order unless an earlier one was picked from the list.
  const order = orders.find((o) => o.id === selectedId) ?? orders[0];
  const others = orders.filter((o) => o !== order);

  const notify = (opened: boolean) => {
    if (!opened) toast.current?.show('This device cannot open that app.', 'warning');
  };

  const header = {
    title: 'Order Tracking',
    avatarInitials: user?.initials,
    actions: order
      ? [{ icon: 'notifications' as const, label: 'Notifications', onPress: () => toast.current?.show(order.statusLabel, 'local_shipping') }]
      : [],
  };

  if (!order) {
    return (
      <UI.Screen inTabs header={header}>
        <UI.Card tone="muted" style={styles.empty}>
          {!state.loaded ? (
            <ActivityIndicator color={Palette.accent} />
          ) : (
            <>
              <UI.Icon name={state.error ? 'warning' : 'receipt_long'} size={40} color={Palette.outline} />
              <UI.Text variant="headlineSm">{state.error ? 'Could not load orders' : 'No orders yet'}</UI.Text>
              <UI.Text color="textMuted" align="center">
                {state.error ?? 'Place a pooled order from the marketplace and track it here live.'}
              </UI.Text>
              <UI.Button
                label={state.error ? 'Try again' : 'Go to Shop'}
                icon={state.error ? 'sync' : 'storefront'}
                variant="brand"
                onPress={() => (state.error ? OrderStore.instance.refresh() : router.navigate('/'))}
              />
            </>
          )}
        </UI.Card>
      </UI.Screen>
    );
  }

  return (
    <UI.Screen inTabs header={header} overlay={<UI.Toast ref={toast} />}>
      <Vuka.OrderHero order={order} />

      <Vuka.DriverCard
        driver={order.driver}
        onCall={async () => notify(await ContactService.call(order.driver.phone))}
        onChat={async () =>
          notify(await ContactService.whatsApp(order.driver.phone, `Hi ${order.driver.firstName}, it's ${user?.shop.name} about order #${order.id}.`))
        }
      />

      {!order.isDelivered && <Vuka.HandoverPinCard key={order.id} order={order} />}

      <Vuka.MilestoneTimeline milestones={order.milestones} progress={order.progress} completed={order.completedMilestones} />

      <Vuka.EscrowBanner
        title="Impelo Escrow Vault"
        status={order.isDelivered ? 'Released' : 'Protected'}
        body={
          order.isDelivered
            ? `Handover PIN confirmed at ${order.etaTime}. ${order.escrowAmount.format({ cents: true })} was released to ${order.supplier} and logged in your Books.`
            : `${order.escrowAmount.format({ cents: true })} is held safely in escrow. Funds are released to ${order.supplier} only after you give your handover PIN.`
        }
      />

      {others.length > 0 && (
        <UI.Card style={{ gap: 4 }}>
          <UI.SectionHeader title="Other orders" trailing={`${others.length}`} />
          {others.map((o) => (
            <UI.ListRow
              key={o.id}
              icon={o.isDelivered ? 'check_circle' : 'local_shipping'}
              iconColor={Palette.accent}
              title={`#${o.id} • ${o.escrowAmount.format()}`}
              subtitle={o.statusLabel}
              showChevron
              onPress={() => setSelectedId(o.id)}
            />
          ))}
        </UI.Card>
      )}

      <Vuka.ReportProblemCard
        hotline={MockDatabase.supportHotline}
        onSnap={() => toast.current?.show('Photo logged – a mediator will review the crate.', 'photo_camera')}
        onCallSupport={async () => notify(await ContactService.call(MockDatabase.supportHotline))}
      />
    </UI.Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: Spacing.gutter, paddingVertical: Spacing.xl },
});
