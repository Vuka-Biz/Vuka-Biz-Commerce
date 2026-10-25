import { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { UI, type IconName } from '@/components/ui';
import type { CreditScore, FundingReadiness, FundingStep, LedgerSummary, User } from '@/models';
import { Palette, type PaletteColor, Radius, Spacing } from '@/theme/tokens';

type StatTileProps = {
  label: string;
  value: string;
  icon: IconName;
  caption: string;
  captionIcon?: IconName;
  captionColor?: PaletteColor;
};

export class StatTile extends PureComponent<StatTileProps> {
  render() {
    const { label, value, icon, caption, captionIcon, captionColor = 'textMuted' } = this.props;
    return (
      <UI.Card padding="gutter" style={styles.tile}>
        <UI.Row justify="space-between">
          <UI.Text variant="labelSm" color="textMuted" uppercase>
            {label}
          </UI.Text>
          <UI.Icon name={icon} size={20} color={Palette.accent} />
        </UI.Row>
        <UI.Text variant="headlineLg">{value}</UI.Text>
        <UI.Row gap="xxs">
          {captionIcon && <UI.Icon name={captionIcon} size={14} color={Palette[captionColor]} />}
          <UI.Text variant="bodySm" color={captionColor} numberOfLines={1}>
            {caption}
          </UI.Text>
        </UI.Row>
      </UI.Card>
    );
  }
}

export class TradePulseCard extends PureComponent<{ ledger: LedgerSummary }> {
  render() {
    const { ledger } = this.props;
    return (
      <UI.Card tone="brand" style={{ gap: Spacing.sm }}>
        <UI.Row justify="space-between">
          <UI.Row gap="xs">
            <UI.Icon name="monitoring" size={18} color={Palette.accentBright} />
            <UI.Text variant="labelMd" color="accentBright" uppercase>
              Trade Pulse
            </UI.Text>
          </UI.Row>
          <UI.Text variant="bodySm" color="brandMuted">
            Updated {ledger.updatedAt}
          </UI.Text>
        </UI.Row>
        <UI.Text variant="bodySm" color="brandMuted">
          Gross Spaza Profit
        </UI.Text>
        <UI.Row gap="sm" align="flex-end">
          <UI.Text variant="display" color="onBrand">
            {ledger.grossProfit.format()}
          </UI.Text>
          <UI.Badge label={`+${ledger.growthPercent}%`} icon="trending_up" tone="accent" style={{ marginBottom: 6 }} />
        </UI.Row>
        <View style={styles.floatRow}>
          <UI.Icon name="payments" size={18} color={Palette.accentBright} />
          <UI.Text variant="bodySm" color="onBrand" style={{ flex: 1 }}>
            Cash float on hand
          </UI.Text>
          <UI.Text variant="labelLg" color="onBrand">
            {ledger.cashFloat.format()}
          </UI.Text>
        </View>
      </UI.Card>
    );
  }
}

export class WeeklyFlowChart extends PureComponent<{ ledger: LedgerSummary }> {
  static readonly CHART_HEIGHT = 120;

  private barHeight(value: number): number {
    return Math.max(6, (value / this.props.ledger.maxWeeklyValue) * WeeklyFlowChart.CHART_HEIGHT);
  }

  private renderLegend(color: string, label: string) {
    return (
      <UI.Row gap="xs">
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <UI.Text variant="bodySm" color="textMuted">
          {label}
        </UI.Text>
      </UI.Row>
    );
  }

  render() {
    const { ledger } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between">
          <UI.Stack>
            <UI.Text variant="labelLg" uppercase>
              Weekly Flow
            </UI.Text>
            <UI.Text variant="bodySm" color="textMuted">
              Sales vs. stock sourcing
            </UI.Text>
          </UI.Stack>
          <UI.Row gap="gutter">
            {this.renderLegend(Palette.accent, 'Sales')}
            {this.renderLegend(Palette.surfaceHighest, 'Stock')}
          </UI.Row>
        </UI.Row>
        <View style={styles.chart} accessibilityLabel="Weekly sales versus stock bar chart">
          {ledger.weeks.map((week) => (
            <View key={week.label} style={styles.week}>
              <UI.Text variant="labelSm" color="text">
                {week.salesLabel}
              </UI.Text>
              <View style={styles.bars}>
                <View style={[styles.bar, { height: this.barHeight(week.sales), backgroundColor: Palette.accent }]} />
                <View
                  style={[styles.bar, { height: this.barHeight(week.stock), backgroundColor: Palette.surfaceHighest }]}
                />
              </View>
              <UI.Text variant="labelSm" color="textMuted">
                {week.label}
              </UI.Text>
            </View>
          ))}
        </View>
        <View style={styles.peak}>
          <UI.Icon name="star" size={18} color={Palette.amberText} />
          <UI.Text variant="bodyStrong" style={{ flex: 1 }}>
            Peak Day: {ledger.peakDay}
          </UI.Text>
          <UI.Text variant="labelMd" color="amberText">
            {ledger.peakTakings.format()} taken
          </UI.Text>
        </View>
      </UI.Card>
    );
  }
}

type CreditScoreCardProps = { score: CreditScore; onOpenFacility: () => void };

export class CreditScoreCard extends PureComponent<CreditScoreCardProps> {
  render() {
    const { score, onOpenFacility } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.Row justify="space-between">
          <UI.Row gap="xs">
            <UI.Icon name="verified_user" size={20} color={Palette.accent} />
            <UI.Text variant="labelLg" uppercase>
              Vuka Credit Score
            </UI.Text>
          </UI.Row>
          <UI.Badge label={score.tier} tone="brand" />
        </UI.Row>
        <UI.Row gap="md" align="flex-end">
          <UI.Text variant="display" style={{ fontSize: 52, lineHeight: 56 }}>
            {score.score}
          </UI.Text>
          <UI.Stack style={{ paddingBottom: 8 }} gap="xxs">
            <UI.Text variant="labelSm" color="textMuted">
              OF {score.max} MAX
            </UI.Text>
            <UI.Badge label={score.standing} tone="accent" uppercase />
          </UI.Stack>
        </UI.Row>
        <UI.ProgressBar value={score.ratio} height={10} />
        <UI.Text variant="bodySm" color="textMuted">
          Built from {score.verifiedTrades} verified supplier trades and consistent on-time account settlements.
        </UI.Text>
        <UI.Card tone="muted" padding="gutter" onPress={onOpenFacility}>
          <UI.ListRow
            icon="account_balance_wallet"
            iconBackground={Palette.brand}
            iconColor={Palette.accentBright}
            title="Unlocked Float Capacity"
            subtitle={`${score.facility.format()} Micro-Capital Facility`}
            showChevron
          />
        </UI.Card>
      </UI.Card>
    );
  }
}

type FundingChecklistProps = { funding: FundingReadiness; onStart: (step: FundingStep) => void };

export class FundingChecklist extends PureComponent<FundingChecklistProps> {
  private renderStep(step: FundingStep) {
    const status =
      step.status === 'verified'
        ? <UI.Badge label="Verified" tone="accent" uppercase />
        : step.status === 'active'
          ? <UI.Badge label="Active" tone="success" uppercase />
          : <UI.Button label={`Start • ${step.cost}`} size="sm" variant="brand" onPress={() => this.props.onStart(step)} />;

    return (
      <UI.Row key={step.title} gap="gutter" style={{ paddingVertical: Spacing.xs }}>
        <UI.Icon
          name={step.isComplete ? 'check_circle' : 'radio_button_unchecked'}
          size={24}
          color={step.isComplete ? Palette.accent : Palette.outlineVariant}
        />
        <UI.Stack flex={1}>
          <UI.Text variant="bodyStrong">{step.title}</UI.Text>
          <UI.Text variant="bodySm" color="textMuted">
            {step.detail}
          </UI.Text>
        </UI.Stack>
        {status}
      </UI.Row>
    );
  }

  render() {
    const { funding } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.gutter }}>
        <UI.SectionHeader
          title="Funding Readiness"
          trailing={`${funding.completed} of ${funding.steps.length} steps completed`}
        />
        <UI.ProgressBar value={funding.completed / funding.steps.length} color={Palette.amber} />
        <UI.Text variant="bodySm" color="textMuted">
          Complete the remaining {funding.remaining} steps to unlock up to {funding.unlockAmount} asset finance.
        </UI.Text>
        {funding.steps.map((step) => this.renderStep(step))}
      </UI.Card>
    );
  }
}

type ProfileCardProps = {
  user: User;
  onRegister: () => void;
  onDownload: () => void;
  onSignOut: () => void;
};

export class ProfileCard extends PureComponent<ProfileCardProps> {
  render() {
    const { user, onRegister, onDownload, onSignOut } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.md }}>
        <UI.Row gap="gutter">
          <View style={styles.avatar}>
            <UI.Text variant="headlineSm" color="brand">
              {user.initials}
            </UI.Text>
          </View>
          <UI.Stack flex={1}>
            <UI.Text variant="titleMd">{user.fullName}</UI.Text>
            <UI.Row gap="xxs">
              <UI.Icon name="check_circle" size={14} color={Palette.accent} />
              <UI.Text variant="bodySm" color="textMuted" numberOfLines={1}>
                {user.shop.name} • {user.shop.zone}
              </UI.Text>
            </UI.Row>
            <UI.Text variant="bodySm" color="outline">
              Vuka Partner since {user.shop.memberSince}
            </UI.Text>
          </UI.Stack>
        </UI.Row>
        <UI.Button label="Register My Business (CIPC)" icon="domain_add" variant="brand" onPress={onRegister} fullWidth />
        <UI.Button label="Download Invoice Pack (PDF)" icon="receipt_long" variant="secondary" onPress={onDownload} fullWidth />
        <UI.Button label="Sign out" icon="logout" variant="ghost" onPress={onSignOut} fullWidth />
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: Spacing.xs },
  floatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    padding: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(79, 99, 89, 0.35)',
  },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  week: { alignItems: 'center', gap: Spacing.xs },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: WeeklyFlowChart.CHART_HEIGHT },
  bar: { width: 18, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  peak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: '#fff4e5',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
