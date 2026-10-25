import { PureComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { UI, type IconName } from '@/components/ui';
import type { BadgeTone } from '@/components/ui/Badge';
import { type ApiAuditEntry, type ApiOrder, type ApiOrderStatus, Money } from '@/models';
import { Palette, Radius, Spacing } from '@/theme/tokens';

/* ---------- Helpers ---------- */

const STATUS: Record<ApiOrderStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  placed: { label: 'Open', tone: 'brand', icon: 'local_shipping' },
  delivered: { label: 'Delivered', tone: 'success', icon: 'check_circle' },
  locked: { label: 'Locked', tone: 'amber', icon: 'lock' },
};

const AUDIT: Record<ApiAuditEntry['action'], { label: string; actor: string; icon: IconName }> = {
  placed: { label: 'Order placed, paid into escrow', actor: 'Owner', icon: 'check' },
  wrong_pin: { label: 'Wrong handover PIN entered', actor: 'Driver', icon: 'warning' },
  locked: { label: 'Locked after too many wrong PINs', actor: 'System', icon: 'lock' },
  delivered: { label: 'PIN confirmed, escrow released', actor: 'Driver', icon: 'payments' },
  unlocked: { label: 'Unlocked with a new PIN', actor: 'Support', icon: 'lock_open' },
};

/** "25 Oct, 10:42" */
function when(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return `${d.getDate()} ${months[d.getMonth()]}, ${time}`;
}

function shopOf(order: ApiOrder): string {
  return `${(order.ownerName ?? 'Spaza owner').split(' ')[0]}'s Spaza`;
}

function itemsOf(order: ApiOrder): string {
  return order.lines.map((l) => `${l.quantity}× ${l.name}`).join(', ');
}

export class StatusBadge extends PureComponent<{ status: ApiOrderStatus }> {
  render() {
    const s = STATUS[this.props.status];
    return <UI.Badge label={s.label} icon={s.icon} tone={s.tone} uppercase />;
  }
}

/* ---------- KPI tiles ---------- */

type KpiTileProps = { label: string; value: string; icon: IconName; caption: string; alert?: boolean };

export class KpiTile extends PureComponent<KpiTileProps> {
  render() {
    const { label, value, icon, caption, alert } = this.props;
    return (
      <UI.Card tone={alert ? 'amber' : 'surface'} padding="gutter" style={styles.kpi}>
        <UI.Row justify="space-between">
          <UI.Text variant="labelSm" color="textMuted" uppercase>
            {label}
          </UI.Text>
          <UI.Icon name={icon} size={20} color={alert ? Palette.amberText : Palette.accent} />
        </UI.Row>
        <UI.Text variant="headlineLg">{value}</UI.Text>
        <UI.Text variant="bodySm" color="textMuted" numberOfLines={1}>
          {caption}
        </UI.Text>
      </UI.Card>
    );
  }
}

/** The headline numbers for the console, computed from the order list. */
export class KpiRow extends PureComponent<{ orders: readonly ApiOrder[] }> {
  render() {
    const { orders } = this.props;
    const by = (status: ApiOrderStatus) => orders.filter((o) => o.status === status);
    const sum = (list: ApiOrder[]) => list.reduce((total, o) => total.add(Money.of(o.total)), Money.zero);
    const open = by('placed');
    const delivered = by('delivered');
    const locked = by('locked');
    return (
      <UI.Row gap="sm" wrap align="stretch">
        <KpiTile label="Open orders" value={String(open.length)} icon="local_shipping" caption="Waiting for handover" />
        <KpiTile label="Delivered" value={String(delivered.length)} icon="check_circle" caption="PIN verified" />
        <KpiTile
          label="Locked"
          value={String(locked.length)}
          icon="lock"
          caption={locked.length ? 'Needs support' : 'All clear'}
          alert={locked.length > 0}
        />
        <KpiTile label="Escrow held" value={sum([...open, ...locked]).format()} icon="account_balance" caption="Not yet released" />
        <KpiTile label="Released" value={sum(delivered).format()} icon="payments" caption="Paid to suppliers" />
      </UI.Row>
    );
  }
}

/* ---------- Locked orders ---------- */

type AttentionCardProps = {
  orders: readonly ApiOrder[];
  /** Order id waiting for a second tap to confirm. */
  confirming: string | null;
  busy: string | null;
  onUnlock: (order: ApiOrder) => void;
  onCancel: () => void;
};

export class AttentionCard extends PureComponent<AttentionCardProps> {
  render() {
    const { orders, confirming, busy, onUnlock, onCancel } = this.props;
    if (orders.length === 0) return null;
    return (
      <UI.Card tone="amber" style={{ gap: Spacing.gutter }}>
        <UI.Row gap="sm">
          <UI.Icon name="warning" size={22} color={Palette.amberText} />
          <UI.Stack flex={1}>
            <UI.Text variant="titleMd">Needs attention</UI.Text>
            <UI.Text variant="bodySm" color="textMuted">
              Locked after 5 wrong PINs. Call the shop to confirm the stock arrived, then unlock. The owner gets a new PIN.
            </UI.Text>
          </UI.Stack>
        </UI.Row>
        {orders.map((order) => {
          const isConfirming = confirming === order.id;
          return (
            <View key={order.id} style={styles.attentionRow}>
              <UI.Stack flex={1} gap="xxs">
                <UI.Text variant="bodyStrong">
                  #{order.id} • {shopOf(order)} • {Money.of(order.total).format()}
                </UI.Text>
                <UI.Text variant="bodySm" color="textMuted" numberOfLines={1}>
                  {itemsOf(order)}
                </UI.Text>
              </UI.Stack>
              {isConfirming && <UI.Button label="Cancel" size="sm" variant="ghost" onPress={onCancel} />}
              <UI.Button
                label={isConfirming ? 'Confirm unlock' : 'Unlock'}
                icon="lock_open"
                size="sm"
                variant={isConfirming ? 'brand' : 'secondary'}
                loading={busy === order.id}
                onPress={() => onUnlock(order)}
              />
            </View>
          );
        })}
      </UI.Card>
    );
  }
}

/* ---------- Orders table ---------- */

type OrdersTableProps = {
  orders: readonly ApiOrder[];
  selectedId: string | null;
  onSelect: (order: ApiOrder) => void;
  /** Table columns on desktop, stacked cards on phones. */
  wide: boolean;
};

export class OrdersTable extends PureComponent<OrdersTableProps> {
  private renderWideRow(order: ApiOrder) {
    const selected = order.id === this.props.selectedId;
    return (
      <Pressable
        key={order.id}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => this.props.onSelect(order)}
        style={({ hovered }) => [styles.tr, hovered && styles.trHover, selected && styles.trSelected]}>
        <UI.Text variant="bodyStrong" style={styles.colId}>
          #{order.id}
        </UI.Text>
        <UI.Text style={styles.colShop} numberOfLines={1}>
          {shopOf(order)}
        </UI.Text>
        <UI.Text variant="bodySm" color="textMuted" style={styles.colItems} numberOfLines={1}>
          {itemsOf(order)}
        </UI.Text>
        <UI.Text variant="bodyStrong" style={styles.colTotal}>
          {Money.of(order.total).format()}
        </UI.Text>
        <View style={styles.colStatus}>
          <StatusBadge status={order.status} />
        </View>
        <UI.Text variant="bodySm" color="textMuted" style={styles.colTime}>
          {when(order.createdAt)}
        </UI.Text>
      </Pressable>
    );
  }

  private renderCard(order: ApiOrder) {
    const selected = order.id === this.props.selectedId;
    return (
      <Pressable
        key={order.id}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => this.props.onSelect(order)}
        style={[styles.card, selected && styles.trSelected]}>
        <UI.Row justify="space-between" gap="sm">
          <UI.Text variant="bodyStrong">#{order.id}</UI.Text>
          <StatusBadge status={order.status} />
        </UI.Row>
        <UI.Row justify="space-between" gap="sm">
          <UI.Text>{shopOf(order)}</UI.Text>
          <UI.Text variant="bodyStrong">{Money.of(order.total).format()}</UI.Text>
        </UI.Row>
        <UI.Text variant="bodySm" color="textMuted" numberOfLines={1}>
          {when(order.createdAt)} • {itemsOf(order)}
        </UI.Text>
      </Pressable>
    );
  }

  render() {
    const { orders, wide } = this.props;
    if (orders.length === 0) {
      return (
        <UI.Text color="textMuted" align="center" style={{ paddingVertical: Spacing.lg }}>
          No orders match.
        </UI.Text>
      );
    }
    if (!wide) return <UI.Stack gap="sm">{orders.map((o) => this.renderCard(o))}</UI.Stack>;
    return (
      <View accessibilityRole="list">
        <View style={[styles.tr, styles.th]}>
          {(
            [
              ['Order', styles.colId],
              ['Shop', styles.colShop],
              ['Items', styles.colItems],
              ['Total', styles.colTotal],
              ['Status', styles.colStatus],
              ['Placed', styles.colTime],
            ] as const
          ).map(([label, style]) => (
            <UI.Text key={label} variant="labelSm" color="textMuted" uppercase style={style}>
              {label}
            </UI.Text>
          ))}
        </View>
        {orders.map((o) => this.renderWideRow(o))}
      </View>
    );
  }
}

/* ---------- Order detail ---------- */

export class OrderDetail extends PureComponent<{ order: ApiOrder; onClose: () => void }> {
  render() {
    const { order, onClose } = this.props;
    const money = (amount: number) => Money.of(amount).format({ cents: true });
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between" align="flex-start">
          <UI.Stack gap="xxs" flex={1}>
            <UI.Text variant="labelSm" color="textMuted" uppercase>
              Order detail
            </UI.Text>
            <UI.Text variant="headlineSm">#{order.id}</UI.Text>
            <UI.Text variant="bodySm" color="textMuted">
              {shopOf(order)} • {order.ownerName} • placed {when(order.createdAt)}
            </UI.Text>
          </UI.Stack>
          <UI.Button label="Close" size="sm" variant="ghost" onPress={onClose} />
        </UI.Row>

        <UI.Stack gap="xs">
          {order.lines.map((l) => (
            <UI.Row key={l.productId} justify="space-between" gap="sm">
              <UI.Text style={{ flex: 1 }}>
                {l.quantity}× {l.name}
              </UI.Text>
              <UI.Text>{money(l.unitPrice * l.quantity)}</UI.Text>
            </UI.Row>
          ))}
          <UI.Divider />
          <UI.Row justify="space-between">
            <UI.Text color="textMuted">Pool discount</UI.Text>
            <UI.Text color="accent">-{money(order.poolDiscount)}</UI.Text>
          </UI.Row>
          <UI.Row justify="space-between">
            <UI.Text color="textMuted">Delivery ({order.deliveryId})</UI.Text>
            <UI.Text>{money(order.deliveryFee)}</UI.Text>
          </UI.Row>
          <UI.Row justify="space-between">
            <UI.Text variant="bodyStrong">Total in escrow • {order.paymentId.toUpperCase()}</UI.Text>
            <UI.Text variant="bodyStrong">{money(order.total)}</UI.Text>
          </UI.Row>
        </UI.Stack>

        <UI.Stack gap="sm">
          <UI.SectionHeader title="Audit trail" icon="history" trailing={<StatusBadge status={order.status} />} />
          {(order.audit ?? []).length === 0 && (
            <UI.Text variant="bodySm" color="textMuted">
              No audit entries (order predates the audit trail).
            </UI.Text>
          )}
          {(order.audit ?? []).map((entry, i) => {
            const a = AUDIT[entry.action];
            return (
              <UI.Row key={`${entry.at}-${i}`} gap="sm" align="flex-start">
                <View style={styles.auditDot}>
                  <UI.Icon name={a.icon} size={14} color={Palette.onBrand} />
                </View>
                <UI.Stack flex={1}>
                  <UI.Text variant="bodyStrong">{a.label}</UI.Text>
                  <UI.Text variant="bodySm" color="textMuted">
                    {when(entry.at)} • {a.actor} • {entry.by.slice(0, 8)}…
                  </UI.Text>
                </UI.Stack>
              </UI.Row>
            );
          })}
        </UI.Stack>

        <UI.Row gap="xs">
          <UI.Icon name="lock" size={14} color={Palette.outline} />
          <UI.Text variant="bodySm" color="outline" style={{ flex: 1 }}>
            Handover PINs are never shown to support staff. Only the shop owner can see them.
          </UI.Text>
        </UI.Row>
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  kpi: { flexGrow: 1, flexBasis: 160, gap: Spacing.xs },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceLowest,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
    paddingVertical: Spacing.gutter,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceHighest,
  },
  th: { paddingVertical: Spacing.sm },
  trHover: { backgroundColor: Palette.surfaceLow },
  trSelected: { backgroundColor: Palette.surfaceContainer },
  colId: { width: 110 },
  colShop: { width: 140 },
  colItems: { flex: 1 },
  colTotal: { width: 90, textAlign: 'right' },
  colStatus: { width: 120, alignItems: 'flex-start' },
  colTime: { width: 110 },
  card: {
    gap: Spacing.xs,
    padding: Spacing.gutter,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.surfaceHighest,
  },
  auditDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
