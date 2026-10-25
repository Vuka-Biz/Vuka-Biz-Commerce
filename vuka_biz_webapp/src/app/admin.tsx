import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import type { ApiOrder, ApiOrderStatus } from '@/models';
import { AdminStore } from '@/services/AdminStore';
import { AuthStore } from '@/services/AuthStore';
import { useStore } from '@/services/ObservableStore';
import { Palette, Spacing, WideContentWidth } from '@/theme/tokens';

type Filter = ApiOrderStatus | 'all';

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'placed', label: 'Open' },
  { value: 'locked', label: 'Locked' },
  { value: 'delivered', label: 'Delivered' },
];

/** Table layout from this width; stacked cards below it. */
const WIDE_BREAKPOINT = 760;
/** Detail panel sits beside the table from this width. */
const SPLIT_BREAKPOINT = 1100;

/** Support console for Vuka Biz staff: live orders across all shops, unlock PIN-locked orders. */
export default function AdminConsoleScreen() {
  const { user } = useStore(AuthStore.instance);
  const { orders, loaded, error, updatedAt } = useStore(AdminStore.instance);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  const q = query.trim().toLowerCase();
  const visible = orders.filter(
    (o) =>
      (filter === 'all' || o.status === filter) &&
      (!q || o.id.toLowerCase().includes(q) || (o.ownerName ?? '').toLowerCase().includes(q)),
  );
  const locked = orders.filter((o) => o.status === 'locked');
  const selected = orders.find((o) => o.id === selectedId);
  const split = width >= SPLIT_BREAKPOINT && !!selected;

  const unlock = async (order: ApiOrder) => {
    // First tap arms the button, second tap unlocks.
    if (confirming !== order.id) return setConfirming(order.id);
    setBusy(order.id);
    const failure = await AdminStore.instance.unlock(order.id);
    setBusy(null);
    setConfirming(null);
    toast.current?.show(failure ?? `#${order.id} unlocked – the owner has a new PIN`, failure ? 'warning' : 'lock_open');
  };

  const updated = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '…';

  const table = (
    <UI.Card style={{ gap: Spacing.gutter, flex: split ? 3 : undefined }}>
      <UI.SectionHeader title="Orders" icon="receipt_long" trailing={`${visible.length} of ${orders.length}`} />
      <UI.TextField
        icon="search"
        placeholder="Search by order number or owner"
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search orders"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => (
          <UI.Chip
            key={f.value}
            label={f.value === 'locked' && locked.length ? `${f.label} (${locked.length})` : f.label}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </ScrollView>
      <Vuka.OrdersTable
        orders={visible}
        selectedId={selectedId}
        wide={width >= WIDE_BREAKPOINT}
        onSelect={(o) => setSelectedId(o.id === selectedId ? null : o.id)}
      />
    </UI.Card>
  );

  const detail = selected && <Vuka.OrderDetail order={selected} onClose={() => setSelectedId(null)} />;

  return (
    <UI.Screen
      maxWidth={WideContentWidth}
      header={{
        title: 'Support Console',
        brandIcon: 'support_agent',
        avatarInitials: user?.initials,
        actions: [
          { icon: 'sync', label: 'Refresh', onPress: () => AdminStore.instance.refresh() },
          { icon: 'logout', label: 'Sign out', onPress: () => AuthStore.instance.logout() },
        ],
      }}
      overlay={<UI.Toast ref={toast} />}>
      <UI.Row justify="space-between" align="flex-end" gap="sm" wrap>
        <UI.Stack gap="xxs">
          <UI.Text variant="labelSm" color="accent" uppercase>
            Live operations
          </UI.Text>
          <UI.Text variant="headlineLg">All spaza orders</UI.Text>
        </UI.Stack>
        <UI.Row gap="xs">
          <View style={[styles.liveDot, error ? styles.liveDotError : null]} />
          <UI.Text variant="bodySm" color="textMuted">
            {error ? 'Connection problem – retrying' : `Updated ${updated} • refreshes every 5 s`}
          </UI.Text>
        </UI.Row>
      </UI.Row>

      {!loaded ? (
        <UI.Card tone="muted" style={styles.loading}>
          <ActivityIndicator color={Palette.accent} />
          <UI.Text color="textMuted">Loading orders…</UI.Text>
        </UI.Card>
      ) : error && orders.length === 0 ? (
        <UI.Card tone="danger" style={{ gap: Spacing.sm }}>
          <UI.Text variant="titleMd" color="onErrorContainer">
            Could not load orders
          </UI.Text>
          <UI.Text variant="bodySm" color="onErrorContainer">
            {error}
          </UI.Text>
          <UI.Button label="Try again" icon="sync" variant="danger" onPress={() => AdminStore.instance.refresh()} />
        </UI.Card>
      ) : (
        <>
          <Vuka.KpiRow orders={orders} />
          <Vuka.AttentionCard
            orders={locked}
            confirming={confirming}
            busy={busy}
            onUnlock={unlock}
            onCancel={() => setConfirming(null)}
          />
          {split ? (
            <View style={styles.split}>
              {table}
              <View style={{ flex: 2 }}>{detail}</View>
            </View>
          ) : (
            <>
              {detail}
              {table}
            </>
          )}
        </>
      )}
    </UI.Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: Spacing.xs },
  loading: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  split: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.accentSoft },
  liveDotError: { backgroundColor: Palette.error },
});
