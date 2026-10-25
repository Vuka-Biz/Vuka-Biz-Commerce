import { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { UI } from '@/components/ui';
import type { Driver, Milestone, Order, RouteStop } from '@/models';
import { Palette, Radius, Spacing } from '@/theme/tokens';

/** Live ETA card with the corridor stops. */
export class OrderHero extends PureComponent<{ order: Order }> {
  private renderStop(stop: RouteStop, index: number) {
    const done = stop.status === 'done';
    const active = stop.status === 'active';
    return (
      <View key={stop.name} style={styles.stop}>
        <View style={[styles.stopDot, done && styles.stopDone, active && styles.stopActive]}>
          {done ? (
            <UI.Icon name="check" size={14} color={Palette.brand} />
          ) : (
            <UI.Text variant="labelSm" color={active ? 'brand' : 'brandMuted'}>
              {index + 1}
            </UI.Text>
          )}
        </View>
        <UI.Text
          variant="labelSm"
          color={active ? 'accentBright' : done ? 'onBrand' : 'brandMuted'}
          align="center"
          numberOfLines={2}>
          {stop.isYou ? `${stop.name} (You)` : stop.name}
        </UI.Text>
      </View>
    );
  }

  render() {
    const { order } = this.props;
    return (
      <UI.Card tone="brand" style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between" align="flex-start">
          <UI.Stack gap="xxs" flex={1}>
            <UI.Badge label="Live batch dispatch" icon="sensors" tone="brandOnDark" uppercase />
            <UI.Text variant="headlineMd" color="onBrand">
              {order.corridor}
            </UI.Text>
            <UI.Text variant="bodySm" color="brandMuted">
              Order #{order.id}
            </UI.Text>
          </UI.Stack>
          <UI.Stack align="flex-end">
            <UI.Text variant="labelSm" color="brandMuted" uppercase>
              ETA
            </UI.Text>
            <UI.Text variant="display" color="accentBright">
              {order.etaTime}
            </UI.Text>
            <UI.Text variant="bodySm" color="onBrand">
              {order.distanceKm} km away
            </UI.Text>
          </UI.Stack>
        </UI.Row>
        <View style={styles.statusPill}>
          <UI.Icon name="near_me" size={18} color={Palette.accentBright} />
          <UI.Text variant="bodyStrong" color="onBrand" style={{ flex: 1 }}>
            {order.statusLabel}
          </UI.Text>
          <UI.Text variant="labelSm" color="accentBright">
            STOP {order.yourStopNumber} OF {order.stops.length}
          </UI.Text>
        </View>
        <View style={styles.stops}>
          <View style={styles.stopLine} />
          {order.stops.map((stop, i) => this.renderStop(stop, i))}
        </View>
      </UI.Card>
    );
  }
}

type DriverCardProps = { driver: Driver; onCall: () => void; onChat: () => void };

export class DriverCard extends PureComponent<DriverCardProps> {
  render() {
    const { driver, onCall, onChat } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.Row gap="gutter">
          <View style={styles.avatar}>
            <UI.Text variant="headlineSm" color="onBrand">
              {driver.initials}
            </UI.Text>
            {driver.verified && (
              <View style={styles.verified}>
                <UI.Icon name="verified" size={16} color={Palette.accent} />
              </View>
            )}
          </View>
          <UI.Stack flex={1} gap="xxs">
            <UI.Row gap="sm">
              <UI.Text variant="titleMd">{driver.displayName}</UI.Text>
              <UI.Row gap="xxs">
                <UI.Icon name="star" size={14} color={Palette.amber} />
                <UI.Text variant="labelMd">{driver.rating.toFixed(1)}</UI.Text>
                <UI.Text variant="bodySm" color="textMuted">
                  ({driver.safeDrops})
                </UI.Text>
              </UI.Row>
            </UI.Row>
            <UI.Text variant="bodySm" color="textMuted">
              Verified Vuka Driver • {driver.vehicle.description}
            </UI.Text>
            <UI.Badge label={driver.vehicle.plate} tone="neutral" pill={false} />
          </UI.Stack>
        </UI.Row>
        <UI.Row gap="sm">
          <UI.Button label="Call Driver" icon="call" variant="brand" onPress={onCall} style={{ flex: 1 }} />
          <UI.Button label="WhatsApp" icon="chat" onPress={onChat} style={{ flex: 1 }} />
        </UI.Row>
      </UI.Card>
    );
  }
}

type HandoverPinCardProps = { order: Order };
type HandoverPinCardState = { revealed: boolean };

/** The shop owner's 4-digit PIN. Hidden until tapped so it isn't shared too early. */
export class HandoverPinCard extends PureComponent<HandoverPinCardProps, HandoverPinCardState> {
  state: HandoverPinCardState = { revealed: false };

  private toggle = () => this.setState((s) => ({ revealed: !s.revealed }));

  render() {
    const { order } = this.props;
    const { revealed } = this.state;
    return (
      <UI.Card tone="brand" style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between">
          <UI.Row gap="xs">
            <UI.Icon name="pin" size={20} color={Palette.accentBright} />
            <UI.Text variant="labelMd" color="onBrand" uppercase>
              Delivery Handover PIN
            </UI.Text>
          </UI.Row>
          <UI.Badge label="Secured" icon="lock" tone="brandOnDark" uppercase />
        </UI.Row>
        <View style={styles.pinRow} accessibilityLabel={revealed ? `PIN ${order.pinDigits.join(' ')}` : 'PIN hidden'}>
          {order.pinDigits.map((digit, i) => (
            <View key={i} style={styles.pinBox}>
              <UI.Text variant="display" color="accentBright">
                {revealed ? digit : '•'}
              </UI.Text>
            </View>
          ))}
        </View>
        <UI.Button
          label={revealed ? 'Hide PIN' : 'Tap to reveal PIN'}
          icon={revealed ? 'visibility_off' : 'visibility'}
          variant="light"
          size="sm"
          onPress={this.toggle}
        />
        <View style={styles.warning}>
          <UI.Icon name="warning" size={18} color={Palette.amber} />
          <UI.Text variant="bodySm" color="onBrand" style={{ flex: 1 }}>
            <UI.Text variant="bodyStrong" color="amber" style={{ fontSize: 12 }}>
              Do not share this code yet!{' '}
            </UI.Text>
            Only give it to {order.driver.firstName} once you have weighed and inspected every crate and bag on your shop
            floor.
          </UI.Text>
        </View>
      </UI.Card>
    );
  }
}

type MilestoneTimelineProps = { milestones: readonly Milestone[]; progress: number; completed: number };

export class MilestoneTimeline extends PureComponent<MilestoneTimelineProps> {
  private renderMilestone(m: Milestone, isLast: boolean) {
    const done = m.status === 'done';
    const active = m.status === 'active';
    const bg = done ? Palette.accent : active ? Palette.brand : Palette.surfaceContainer;
    const fg = done || active ? Palette.onAccent : Palette.outline;
    return (
      <View key={m.title} style={styles.milestone}>
        <View style={styles.rail}>
          <View style={[styles.node, { backgroundColor: bg }, active && styles.nodeActive]}>
            <UI.Icon name={m.icon} size={18} color={fg} />
          </View>
          {!isLast && <View style={[styles.railLine, done && { backgroundColor: Palette.accent }]} />}
        </View>
        <UI.Stack flex={1} gap="xxs" style={{ paddingBottom: isLast ? 0 : Spacing.md }}>
          <UI.Row justify="space-between" gap="sm">
            <UI.Text variant="titleMd" color={m.status === 'pending' ? 'textMuted' : 'text'} style={{ flex: 1 }}>
              {m.title}
            </UI.Text>
            <UI.Text variant="labelSm" color={active ? 'accent' : 'outline'}>
              {m.time}
            </UI.Text>
          </UI.Row>
          <UI.Text variant="bodySm" color="textMuted">
            {m.detail}
          </UI.Text>
          {m.proof && <UI.Badge label={m.proof} icon="photo_camera" tone="accent" />}
        </UI.Stack>
      </View>
    );
  }

  render() {
    const { milestones, progress, completed } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.SectionHeader title="Shipment Milestones" trailing={`${completed} of ${milestones.length} complete`} />
        <UI.ProgressBar value={progress} />
        <View>{milestones.map((m, i) => this.renderMilestone(m, i === milestones.length - 1))}</View>
      </UI.Card>
    );
  }
}

type ReportProblemCardProps = { hotline: string; onSnap: () => void; onCallSupport: () => void };

export class ReportProblemCard extends PureComponent<ReportProblemCardProps> {
  render() {
    const { hotline, onSnap, onCallSupport } = this.props;
    return (
      <UI.Card tone="danger" style={{ gap: Spacing.gutter }}>
        <UI.Row gap="sm">
          <UI.Icon name="report_problem" size={22} color={Palette.error} />
          <UI.Text variant="titleMd" color="onErrorContainer" style={{ flex: 1 }}>
            Report a delivery problem
          </UI.Text>
        </UI.Row>
        <UI.Text variant="bodySm" color="onErrorContainer">
          If items are spoiled or missing, take a photo before giving the PIN. Our live support mediator will adjust the
          escrow amount immediately.
        </UI.Text>
        <UI.Button label="Snap Damaged Crate" icon="photo_camera" variant="danger" onPress={onSnap} fullWidth />
        <UI.ListRow
          icon="call"
          iconBackground={Palette.surfaceLowest}
          iconColor={Palette.error}
          title="24/7 Spaza Support Hotline"
          subtitle={hotline}
          showChevron
          onPress={onCallSupport}
        />
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(79, 99, 89, 0.35)',
  },
  stops: { flexDirection: 'row', justifyContent: 'space-between' },
  stopLine: {
    position: 'absolute',
    top: 13,
    left: '16%',
    right: '16%',
    height: 2,
    backgroundColor: Palette.brandTint,
  },
  stop: { flex: 1, alignItems: 'center', gap: 6 },
  stopDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.brand,
    borderWidth: 2,
    borderColor: Palette.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopDone: { backgroundColor: Palette.accentSoft, borderColor: Palette.accentSoft },
  stopActive: { backgroundColor: Palette.accentBright, borderColor: Palette.onBrand },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Palette.surfaceLowest,
    borderRadius: 10,
    padding: 1,
  },
  pinRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  pinBox: {
    width: 60,
    height: 68,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 185, 95, 0.12)',
  },
  milestone: { flexDirection: 'row', gap: Spacing.gutter },
  rail: { alignItems: 'center', width: 36 },
  node: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  nodeActive: { boxShadow: '0px 0px 0px 4px rgba(108, 248, 187, 0.45)' },
  railLine: { flex: 1, width: 2, marginVertical: 2, backgroundColor: Palette.surfaceHighest },
});
