import { useRef, useState } from 'react';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import { AuthStore } from '@/services/AuthStore';
import { useStore } from '@/services/ObservableStore';
import { OrderStore } from '@/services/OrderStore';
import { Palette } from '@/theme/tokens';

export default function BooksScreen() {
  const { user } = useStore(AuthStore.instance);
  const [exporting, setExporting] = useState(false);
  const toast = useRef<Toast>(null);
  const { orders } = useStore(OrderStore.instance);
  const ledger = OrderStore.ledger(orders);

  const exportPdf = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.current?.show(`${ledger.month} statement saved`, 'file_download');
    }, 1000);
  };

  return (
    <UI.Screen
      inTabs
      header={{ title: 'Books & Vuka Score', avatarInitials: user?.initials }}
      overlay={<UI.Toast ref={toast} />}>
      <UI.Row justify="space-between" align="flex-end" gap="sm">
        <UI.Stack flex={1} gap="xxs">
          <UI.Row gap="xs">
            <UI.Text variant="labelSm" color="accent" uppercase>
              Formal Ledger
            </UI.Text>
            <UI.Badge label="Synced" icon="verified" tone="accent" />
          </UI.Row>
          <UI.Text variant="headlineLg">My Books – {ledger.month}</UI.Text>
          <UI.Text variant="bodySm" color="textMuted">
            Automated digital ledger & credit building
          </UI.Text>
        </UI.Stack>
      </UI.Row>
      <UI.Row gap="sm">
        <UI.Button label={ledger.month} icon="calendar_today" variant="secondary" size="sm" style={{ flex: 1 }} />
        <UI.Button
          label={exporting ? 'Preparing…' : 'Export PDF'}
          icon="file_download"
          variant="brand"
          size="sm"
          loading={exporting}
          onPress={exportPdf}
          style={{ flex: 1 }}
        />
      </UI.Row>

      <Vuka.TradePulseCard ledger={ledger} />

      <UI.Row gap="sm" align="stretch">
        <Vuka.StatTile
          label="Stock Bought"
          value={ledger.stockBought.format()}
          icon="shopping_cart"
          caption={`-${ledger.poolSavingsPercent}% pooled • ${ledger.supplierOrders} orders`}
          captionIcon="savings"
          captionColor="accent"
        />
        <Vuka.StatTile
          label="Sales Logged"
          value={ledger.salesLogged.format()}
          icon="point_of_sale"
          caption="Till + QR • 100% verified"
          captionIcon="qr_code_scanner"
        />
      </UI.Row>

      <Vuka.WeeklyFlowChart ledger={ledger} />

      <Vuka.CreditScoreCard
        score={OrderStore.creditScore(orders)}
        onOpenFacility={() => toast.current?.show('Micro-capital offer opens here', 'account_balance_wallet')}
      />

      <Vuka.FundingChecklist
        funding={MockDatabase.funding}
        onStart={(step) => toast.current?.show(`${step.title}: application started`, 'domain_add')}
      />

      {user && (
        <Vuka.ProfileCard
          user={user}
          onRegister={() => toast.current?.show('CIPC registration form opens here', 'domain_add')}
          onDownload={() => toast.current?.show('Invoice pack downloaded', 'receipt_long')}
          onSignOut={() => AuthStore.instance.logout()}
        />
      )}

      <UI.Card tone="muted" padding="gutter">
        <UI.Row gap="sm" align="flex-start">
          <UI.Icon name="policy" size={20} color={Palette.accent} />
          <UI.Text variant="bodySm" color="textMuted" style={{ flex: 1 }}>
            Vuka rule: only trades paid and settled through your verified Vuka Biz ledger count toward your formal rating
            and micro-credit eligibility.
          </UI.Text>
        </UI.Row>
      </UI.Card>
    </UI.Screen>
  );
}
