import { useRef, useState } from 'react';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import type { DeliveryDrop } from '@/models';
import { AuthStore } from '@/services/AuthStore';
import { useStore } from '@/services/ObservableStore';
import { OrderStore } from '@/services/OrderStore';
import { Palette, Spacing } from '@/theme/tokens';

export default function DriverHubScreen() {
  const { user } = useStore(AuthStore.instance);
  const [shift, setShift] = useState(MockDatabase.driverShift);
  const orderState = useStore(OrderStore.instance);
  const batch = OrderStore.cargoBatch(orderState);
  const [online, setOnline] = useState(true);
  const [routeAccepted, setRouteAccepted] = useState(false);
  const toast = useRef<Toast>(null);

  const confirmHandover = async (drop: DeliveryDrop, pin: string): Promise<string | null> => {
    const error = await OrderStore.instance.confirmHandover(drop.orderId, pin);
    if (error) return error;
    setShift((s) => s.credit(drop.payout));
    toast.current?.show(`${drop.shopName} confirmed! ${drop.payout.format({ cents: true })} credited`, 'payments');
    return null;
  };

  return (
    <UI.Screen
      inTabs
      header={{ title: 'Driver Dispatch Hub', brandIcon: 'local_shipping', avatarInitials: user?.initials }}
      overlay={<UI.Toast ref={toast} />}>
      <Vuka.ShiftCard
        shift={shift}
        online={online}
        onToggle={() => setOnline((o) => !o)}
        onCashout={() =>
          toast.current?.show(`${shift.dailyNet.format({ cents: true })} sent via Ozow to Capitec ••8841`, 'bolt')
        }
      />

      <Vuka.RouteOfferCard
        offer={MockDatabase.routeOffer}
        accepted={routeAccepted}
        disabled={!online}
        onAccept={() => {
          setRouteAccepted(true);
          toast.current?.show('Route assigned! Navigating to Mpumi Farm Co-op', 'near_me');
        }}
      />

      <Vuka.CargoBatchCard batch={batch} onConfirm={confirmHandover} />

      <UI.Card tone="muted" style={{ gap: Spacing.xs }}>
        <UI.Row gap="sm">
          <UI.Icon name="shield" size={20} color={Palette.accent} />
          <UI.Text variant="titleMd">DMRE Fair Fuel Guarantee</UI.Text>
        </UI.Row>
        <UI.Text variant="bodySm" color="textMuted">
          Rates update monthly with the official Department of Mineral Resources & Energy fuel price index (Oct 2026).
          Guaranteed floor rates protect bakkie margins against diesel inflation.
        </UI.Text>
      </UI.Card>
    </UI.Screen>
  );
}
