import { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { UI } from '@/components/ui';
import type { ComplianceReport, ExpiringItem, Hotline, ProductRecall, SafetyTip } from '@/models';
import { Palette, Radius, Spacing } from '@/theme/tokens';

type RecallBannerProps = { recall: ProductRecall; onAction: () => void };

export class RecallBanner extends PureComponent<RecallBannerProps> {
  render() {
    const { recall, onAction } = this.props;
    return (
      <UI.Card tone="danger" style={{ gap: Spacing.sm }}>
        <UI.Row gap="sm">
          <UI.Badge label="Urgent Recall" icon="warning" tone="danger" uppercase />
          <UI.Text variant="labelMd" color="onErrorContainer">
            Batch {recall.batch}
          </UI.Text>
        </UI.Row>
        <UI.Text variant="titleMd" color="onErrorContainer">
          {recall.title}
        </UI.Text>
        <UI.Text variant="bodySm" color="onErrorContainer">
          {recall.detail}
        </UI.Text>
        <UI.Button label="Schedule driver return" icon="local_shipping" variant="danger" size="sm" onPress={onAction} />
      </UI.Card>
    );
  }
}

export class ComplianceCard extends PureComponent<{ report: ComplianceReport }> {
  render() {
    const { report } = this.props;
    return (
      <UI.Card tone="brand" style={{ gap: Spacing.gutter }}>
        <UI.Row gap="sm">
          <UI.IconTile icon="verified" background={Palette.accent} color={Palette.onAccent} round />
          <UI.Stack flex={1}>
            <UI.Text variant="labelSm" color="accentBright" uppercase>
              Spaza Assurance
            </UI.Text>
            <UI.Text variant="headlineSm" color="onBrand">
              Audit Status: {report.percent}% Compliant
            </UI.Text>
          </UI.Stack>
        </UI.Row>
        <UI.Text variant="bodySm" color="brandMuted">
          All {report.totalProducts} products in your shop are traceable – sourced from verified co-ops and accredited
          FMCG distributors with authenticated digital batch barcodes.
        </UI.Text>
        <UI.Row gap="sm">
          <View style={styles.metric}>
            <UI.Icon name="verified_user" size={18} color={Palette.accentBright} />
            <UI.Text variant="labelSm" color="brandMuted" uppercase>
              Seal Integrity
            </UI.Text>
            <UI.Text variant="labelLg" color="onBrand">
              {report.sealStatus}
            </UI.Text>
          </View>
          <View style={styles.metric}>
            <UI.Icon name="qr_code_scanner" size={18} color={Palette.accentBright} />
            <UI.Text variant="labelSm" color="brandMuted" uppercase>
              Chain of Custody
            </UI.Text>
            <UI.Text variant="labelLg" color="onBrand">
              {report.tracedProducts} of {report.totalProducts} Scanned
            </UI.Text>
          </View>
        </UI.Row>
      </UI.Card>
    );
  }
}

type ExpiryAlertCardProps = { items: readonly ExpiringItem[]; actioned: boolean; onAction: () => void };

export class ExpiryAlertCard extends PureComponent<ExpiryAlertCardProps> {
  render() {
    const { items, actioned, onAction } = this.props;
    const days = Math.min(...items.map((i) => i.daysLeft));
    return (
      <UI.Card tone="amber" style={{ gap: Spacing.gutter }}>
        <UI.Row justify="space-between">
          <UI.Row gap="xs">
            <UI.Icon name="event_busy" size={20} color={Palette.amberText} />
            <UI.Text variant="labelLg" uppercase>
              Expiry Warning
            </UI.Text>
          </UI.Row>
          <UI.Badge label={actioned ? 'Scheduled' : 'Action needed'} tone={actioned ? 'success' : 'amber'} />
        </UI.Row>
        <UI.Text variant="titleMd">
          {items.length} items expire in {days} days
        </UI.Text>
        <UI.Text variant="bodySm" color="textMuted">
          Prevent spoilage loss and protect your spaza health rating by marking down or swapping stock with the supplier.
        </UI.Text>
        {items.map((item) => (
          <UI.Card key={item.name} padding="gutter" radius="lg">
            <UI.ListRow
              icon={item.icon}
              iconBackground={Palette.amberSoft}
              iconColor={Palette.onAmber}
              title={item.name}
              subtitle={`${item.supplier} • ${item.unitsLeft}`}
              trailing={<UI.Badge label={`${item.daysLeft} Days`} tone="danger" />}
            />
          </UI.Card>
        ))}
        {actioned ? (
          <View style={styles.success}>
            <UI.Icon name="check_circle" size={18} color={Palette.accent} />
            <UI.Text variant="bodySm" color="accent" style={{ flex: 1 }}>
              30% flash discount applied to your till & swap requested with the driver.
            </UI.Text>
          </View>
        ) : (
          <UI.Button label="Discount or return stock" icon="sell" variant="brand" onPress={onAction} fullWidth />
        )}
      </UI.Card>
    );
  }
}

export class SafetyTipList extends PureComponent<{ tips: readonly SafetyTip[] }> {
  render() {
    return (
      <UI.Card style={{ gap: Spacing.sm }}>
        <UI.SectionHeader icon="policy" title="How to spot fake food" />
        <UI.Text variant="bodySm" color="textMuted">
          Protect your customers and safeguard your spaza operating licence.
        </UI.Text>
        {this.props.tips.map((tip, i) => (
          <UI.Row key={tip.title} gap="gutter" align="flex-start" style={{ paddingVertical: Spacing.xs }}>
            <UI.IconTile icon={tip.icon} background={Palette.surfaceLow} color={Palette.accent} />
            <UI.Stack flex={1} gap="xxs">
              <UI.Text variant="bodyStrong">
                {i + 1}. {tip.title}
              </UI.Text>
              <UI.Text variant="bodySm" color="textMuted">
                {tip.body}
              </UI.Text>
            </UI.Stack>
          </UI.Row>
        ))}
      </UI.Card>
    );
  }
}

type HotlineListProps = { hotlines: readonly Hotline[]; onCall: (hotline: Hotline) => void };

export class HotlineList extends PureComponent<HotlineListProps> {
  render() {
    const { hotlines, onCall } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.xs }}>
        <UI.SectionHeader icon="account_balance" title="Regulatory Hotlines" />
        {hotlines.map((hotline) => (
          <UI.ListRow
            key={hotline.name}
            icon={hotline.icon}
            iconBackground={Palette.surfaceLow}
            iconColor={Palette.brand}
            title={hotline.name}
            subtitle={hotline.number}
            showChevron
            onPress={() => onCall(hotline)}
          />
        ))}
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  metric: {
    flex: 1,
    gap: 2,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(79, 99, 89, 0.35)',
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: '#e3fbef',
  },
});
