import { useRef, useState } from 'react';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import { AuthStore } from '@/services/AuthStore';
import { ContactService } from '@/services/ContactService';
import { useStore } from '@/services/ObservableStore';
import { Palette, Spacing } from '@/theme/tokens';

export default function VukaSafeScreen() {
  const { user } = useStore(AuthStore.instance);
  const [expiryActioned, setExpiryActioned] = useState(false);
  const toast = useRef<Toast>(null);

  return (
    <UI.Screen
      inTabs
      header={{ title: 'Vuka Safe', brandIcon: 'verified_user', avatarInitials: user?.initials }}
      overlay={<UI.Toast ref={toast} />}>
      <UI.Stack gap="xxs">
        <UI.Text variant="headlineLg">Food you can trust</UI.Text>
        <UI.Text variant="bodySm" color="textMuted">
          Recalls, expiry alerts and counterfeit checks for {user?.shop.name ?? 'your shop'}.
        </UI.Text>
      </UI.Stack>

      <Vuka.RecallBanner
        recall={MockDatabase.recall}
        onAction={() => toast.current?.show('Return booked on tomorrow’s drop – full refund on handover', 'local_shipping')}
      />

      <Vuka.ComplianceCard report={MockDatabase.compliance} />

      <Vuka.ExpiryAlertCard
        items={MockDatabase.expiringItems}
        actioned={expiryActioned}
        onAction={() => {
          setExpiryActioned(true);
          toast.current?.show('Flash discount applied & swap requested');
        }}
      />

      <Vuka.SafetyTipList tips={MockDatabase.safetyTips} />

      <UI.Card tone="brand" style={{ gap: Spacing.gutter }}>
        <UI.Row gap="sm">
          <UI.Icon name="report_problem" size={22} color={Palette.amber} />
          <UI.Text variant="titleMd" color="onBrand" style={{ flex: 1 }}>
            Report a suspicious product
          </UI.Text>
        </UI.Row>
        <UI.Text variant="bodySm" color="brandMuted">
          Confidential reporting protects your community and flags unauthorised van sellers.
        </UI.Text>
        <UI.Button
          label="Start confidential report"
          icon="flag"
          variant="light"
          onPress={() => toast.current?.show('Report received – thank you for keeping shelves safe', 'verified_user')}
          fullWidth
        />
      </UI.Card>

      <Vuka.HotlineList
        hotlines={MockDatabase.hotlines}
        onCall={async (hotline) => {
          if (!(await ContactService.call(hotline.number))) toast.current?.show(`Call ${hotline.number}`, 'call');
        }}
      />

      <UI.Text variant="bodySm" color="outline" align="center">
        Vuka Safe aligns with the Foodstuffs, Cosmetics and Disinfectants Act and the Consumer Goods Council of SA.
      </UI.Text>
    </UI.Screen>
  );
}
