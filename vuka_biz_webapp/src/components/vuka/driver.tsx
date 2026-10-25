import { createRef, PureComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PinInput, UI } from '@/components/ui';
import type { CargoBatch, DeliveryDrop, DriverShift, RouteOffer } from '@/models';
import { Palette, Radius, Spacing } from '@/theme/tokens';

type ShiftCardProps = { shift: DriverShift; online: boolean; onToggle: () => void; onCashout: () => void };

export class ShiftCard extends PureComponent<ShiftCardProps> {
  private renderStat(label: string, value: string) {
    return (
      <View style={styles.stat}>
        <UI.Text variant="labelSm" color="brandMuted" uppercase>
          {label}
        </UI.Text>
        <UI.Text variant="labelLg" color="onBrand">
          {value}
        </UI.Text>
      </View>
    );
  }

  render() {
    const { shift, online, onToggle, onCashout } = this.props;
    const { driver } = shift;
    return (
      <UI.Card tone="brand" style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between" align="flex-start" gap="sm">
          <UI.Stack flex={1} gap="xxs">
            <UI.Text variant="labelSm" color="accentBright" uppercase>
              {online ? 'Shift Active' : 'Shift Paused'}
            </UI.Text>
            <UI.Text variant="headlineMd" color="onBrand">
              Good morning, {driver.firstName}
            </UI.Text>
            <UI.Row gap="xs">
              <UI.Icon name="local_shipping" size={16} color={Palette.brandMuted} />
              <UI.Text variant="bodySm" color="brandMuted" numberOfLines={1} style={{ flex: 1 }}>
                {driver.vehicle.model} ({driver.vehicle.plate}) • 1-Ton {driver.vehicle.type}
              </UI.Text>
            </UI.Row>
          </UI.Stack>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: online }}
            accessibilityLabel="Toggle shift online"
            onPress={onToggle}
            style={[styles.toggle, { backgroundColor: online ? Palette.accent : Palette.surfaceHighest }]}>
            <UI.Icon name="sensors" size={16} color={online ? Palette.onAccent : Palette.textMuted} />
            <UI.Text variant="labelSm" color={online ? 'onAccent' : 'textMuted'}>
              {online ? 'ONLINE' : 'STANDBY'}
            </UI.Text>
          </Pressable>
        </UI.Row>
        <UI.Row gap="sm">
          {this.renderStat('Payload Max', `${driver.vehicle.payloadKg.toLocaleString('en-US')} kg`)}
          {this.renderStat('Fuel Tank', `${shift.fuelPercent}%`)}
          {this.renderStat('Rating', `${driver.rating.toFixed(2)} ★`)}
        </UI.Row>
        <UI.Card tone="surface" padding="gutter" style={{ gap: Spacing.sm }}>
          <UI.Row justify="space-between" align="flex-end">
            <UI.Stack>
              <UI.Text variant="labelSm" color="textMuted" uppercase>
                Daily Net Balance
              </UI.Text>
              <UI.Text variant="headlineLg">{shift.dailyNet.format({ cents: true })}</UI.Text>
              <UI.Row gap="xxs">
                <UI.Icon name="task_alt" size={14} color={Palette.accent} />
                <UI.Text variant="bodySm" color="accent">
                  {shift.tripsToday} trips completed today
                </UI.Text>
              </UI.Row>
            </UI.Stack>
            <UI.Stack align="flex-end">
              <UI.Text variant="labelSm" color="textMuted" uppercase>
                {shift.payoutDay} Payout
              </UI.Text>
              <UI.Text variant="headlineSm">{shift.weeklyPayout.format()}</UI.Text>
            </UI.Stack>
          </UI.Row>
          <UI.Button label="Instant Cashout to Ozow" icon="bolt" onPress={onCashout} fullWidth />
        </UI.Card>
      </UI.Card>
    );
  }
}

type RouteOfferCardProps = { offer: RouteOffer; accepted: boolean; disabled: boolean; onAccept: () => void };

export class RouteOfferCard extends PureComponent<RouteOfferCardProps> {
  private renderLeg(icon: 'warehouse' | 'storefront', label: string, value: string) {
    return (
      <UI.Row gap="gutter">
        <UI.IconTile icon={icon} background={Palette.surfaceLow} color={Palette.accent} size={36} />
        <UI.Stack flex={1}>
          <UI.Text variant="labelSm" color="textMuted" uppercase>
            {label}
          </UI.Text>
          <UI.Text variant="bodyStrong">{value}</UI.Text>
        </UI.Stack>
      </UI.Row>
    );
  }

  private renderMoney(label: string, value: string, color: 'text' | 'error' = 'text') {
    return (
      <UI.Row justify="space-between">
        <UI.Text variant="bodySm" color="textMuted">
          {label}
        </UI.Text>
        <UI.Text variant="bodyStrong" color={color}>
          {value}
        </UI.Text>
      </UI.Row>
    );
  }

  render() {
    const { offer, accepted, disabled, onAccept } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between">
          <UI.Row gap="xs">
            <UI.Badge label="Pooled route" tone="brand" uppercase />
            <UI.Text variant="bodySm" color="textMuted">
              {offer.drops} drops • {offer.distanceKm} km
            </UI.Text>
          </UI.Row>
          <UI.Badge label={accepted ? 'Assigned' : 'Ready now'} tone="accent" uppercase />
        </UI.Row>
        <UI.Stack gap="xxs">
          <UI.Text variant="titleMd">{offer.freightTitle}</UI.Text>
          <UI.Text variant="bodySm" color="textMuted">
            {offer.freightDetail}
          </UI.Text>
        </UI.Stack>
        {this.renderLeg('warehouse', 'Pickup Depot', offer.pickup)}
        {this.renderLeg('storefront', 'Delivery Drops', offer.dropZone)}
        <UI.Row gap="sm">
          <UI.Badge label={`Est. ${offer.estMinutes} mins total`} icon="timer" tone="neutral" />
          <UI.Badge label={offer.roadNote} icon="alt_route" tone="neutral" />
        </UI.Row>
        <UI.Card tone="muted" padding="gutter" style={{ gap: Spacing.xs }}>
          <UI.Text variant="labelSm" color="textMuted" uppercase>
            Guaranteed Earnings Math
          </UI.Text>
          {this.renderMoney('Driver gross trip payout', offer.grossPayout.format({ cents: true }))}
          {this.renderMoney(
            `Estimated fuel (${offer.distanceKm} km)`,
            offer.fuelCost.multiply(-1).format({ cents: true }),
            'error',
          )}
          <UI.Divider />
          <UI.Row justify="space-between" align="flex-end">
            <UI.Stack>
              <UI.Text variant="labelMd" color="accent" uppercase>
                Your net profit
              </UI.Text>
              <UI.Text variant="bodySm" color="textMuted">
                Cleared immediately on PIN drop
              </UI.Text>
            </UI.Stack>
            <UI.Text variant="headlineLg" color="accent">
              ≈ {offer.netProfit.format()}
            </UI.Text>
          </UI.Row>
        </UI.Card>
        <UI.Button
          label={accepted ? 'Route assigned – navigating to farm' : 'Accept Route'}
          iconRight={accepted ? undefined : 'arrow_forward'}
          icon={accepted ? 'check_circle' : undefined}
          variant={accepted ? 'secondary' : 'brand'}
          size="lg"
          disabled={accepted || disabled}
          onPress={onAccept}
          fullWidth
        />
      </UI.Card>
    );
  }
}

type CargoBatchCardProps = {
  batch: CargoBatch;
  /** Resolves to an error message, or null when the API accepted the PIN. */
  onConfirm: (drop: DeliveryDrop, pin: string) => Promise<string | null>;
};

type CargoBatchCardState = { pin: string; error: string | null; submitting: boolean };

export class CargoBatchCard extends PureComponent<CargoBatchCardProps, CargoBatchCardState> {
  state: CargoBatchCardState = { pin: '', error: null, submitting: false };

  private readonly pinInput = createRef<PinInput>();

  private handleConfirm = async (drop: DeliveryDrop) => {
    this.setState({ submitting: true, error: null });
    const error = await this.props.onConfirm(drop, this.state.pin);
    this.setState({ error, submitting: false });
    if (!error) this.pinInput.current?.clear();
  };

  private renderDrop(drop: DeliveryDrop, index: number) {
    const isCurrent = drop.status === 'arrived';
    const icon = drop.status === 'done' ? 'check' : drop.status === 'locked' ? 'lock' : drop.status === 'queued' ? 'schedule' : undefined;
    const statusLabel = { done: 'Delivered', arrived: 'Arrived', locked: 'Locked', queued: 'Queued' }[drop.status];

    return (
      <View key={drop.orderId} style={[styles.drop, isCurrent && styles.dropCurrent]}>
        <UI.Row gap="gutter" align="flex-start">
          <View style={[styles.dropNode, drop.status === 'done' && styles.dropNodeDone, isCurrent && styles.dropNodeCurrent]}>
            {icon ? (
              <UI.Icon name={icon} size={16} color={drop.status === 'done' ? Palette.onAccent : Palette.outline} />
            ) : (
              <UI.Text variant="labelMd" color="onBrand">
                {index + 1}
              </UI.Text>
            )}
          </View>
          <UI.Stack flex={1} gap="xxs">
            <UI.Row justify="space-between" gap="sm">
              <UI.Text variant="titleMd" color={drop.status === 'queued' || drop.status === 'locked' ? 'textMuted' : 'text'} style={{ flex: 1 }}>
                Drop {index + 1}: {drop.shopName}
              </UI.Text>
              <UI.Badge
                label={statusLabel}
                tone={isCurrent ? 'success' : drop.status === 'done' ? 'accent' : 'neutral'}
                uppercase
              />
            </UI.Row>
            <UI.Text variant="bodySm" color="textMuted">
              {drop.cargo}
            </UI.Text>
          </UI.Stack>
        </UI.Row>
        {isCurrent && this.renderHandover(drop)}
      </View>
    );
  }

  private renderHandover(drop: DeliveryDrop) {
    const { error, submitting } = this.state;
    return (
      <UI.Stack gap="gutter" style={{ marginTop: Spacing.md }}>
        <UI.Row gap="xs">
          <UI.Icon name="key" size={18} color={Palette.accent} />
          <UI.Text variant="bodyStrong">Ask {drop.contactName} for the 4-digit delivery PIN</UI.Text>
        </UI.Row>
        <UI.PinInput ref={this.pinInput} onChange={(pin) => this.setState({ pin, error: null })} error={!!error} />
        {error && (
          <UI.Text variant="bodySm" color="error" align="center">
            {error}
          </UI.Text>
        )}
        <UI.Button
          label={submitting ? 'Verifying with escrow…' : 'Confirm & Handover Cargo'}
          icon="verified_user"
          variant="brand"
          loading={submitting}
          onPress={() => this.handleConfirm(drop)}
          disabled={this.state.pin.length < 4 || submitting}
          fullWidth
        />
        <UI.Text variant="bodySm" color="outline" align="center">
          {drop.contactName} sees the PIN on their Orders tab. 5 wrong tries lock the order.
        </UI.Text>
      </UI.Stack>
    );
  }

  render() {
    const { batch } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.gutter }}>
        <UI.Row justify="space-between">
          <UI.Stack>
            <UI.Text variant="labelSm" color="textMuted" uppercase>
              Current batch in cargo
            </UI.Text>
            <UI.Text variant="headlineSm">Manifest #{batch.manifestId}</UI.Text>
          </UI.Stack>
          {!batch.isEmpty && (
            <UI.Badge
              label={batch.isComplete ? 'All delivered' : `Drop ${batch.currentIndex + 1} of ${batch.drops.length}`}
              tone={batch.isComplete ? 'success' : 'brand'}
            />
          )}
        </UI.Row>
        <UI.Card tone="accent" padding="gutter" radius="lg">
          <UI.Row gap="sm">
            <UI.Icon name="check_circle" size={20} color={Palette.accent} />
            <UI.Stack flex={1}>
              <UI.Text variant="bodyStrong">Pickup manifest verified</UI.Text>
              <UI.Text variant="bodySm" color="textMuted">
                Cargo photo uploaded & verified at {batch.depot}
              </UI.Text>
            </UI.Stack>
          </UI.Row>
        </UI.Card>
        {batch.isEmpty && (
          <UI.Text color="textMuted" align="center">
            No deliveries waiting. New spaza orders appear here automatically.
          </UI.Text>
        )}
        {batch.drops.map((drop, i) => this.renderDrop(drop, i))}
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.full,
  },
  stat: {
    flex: 1,
    gap: 2,
    padding: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(79, 99, 89, 0.35)',
  },
  drop: { padding: Spacing.gutter, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.surfaceHighest },
  dropCurrent: { borderColor: Palette.accent, borderWidth: 2, backgroundColor: '#f5fffa' },
  dropNode: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Palette.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropNodeDone: { backgroundColor: Palette.accent },
  dropNodeCurrent: { backgroundColor: Palette.brand },
});
