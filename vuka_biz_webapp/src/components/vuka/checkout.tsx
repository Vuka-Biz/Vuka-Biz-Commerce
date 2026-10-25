import { PureComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { UI } from '@/components/ui';
import type { Cart, CheckoutQuote, DeliveryOption, PaymentMethod, PaymentMethodId } from '@/models';
import { Palette, Radius, Spacing } from '@/theme/tokens';

type EscrowBannerProps = { title: string; body: string; status?: string };

/** "Impelo Pay Escrow — Active" trust banner. */
export class EscrowBanner extends PureComponent<EscrowBannerProps> {
  render() {
    const { title, body, status } = this.props;
    return (
      <UI.Card tone="accent" padding="gutter">
        <UI.Row gap="gutter" align="flex-start">
          <UI.IconTile icon="verified_user" background={Palette.accent} color={Palette.onAccent} round />
          <UI.Stack flex={1} gap="xxs">
            <UI.Row gap="sm">
              <UI.Text variant="titleMd">{title}</UI.Text>
              {status && <UI.Badge label={status} tone="success" uppercase />}
            </UI.Row>
            <UI.Text variant="bodySm" color="textMuted">
              {body}
            </UI.Text>
          </UI.Stack>
        </UI.Row>
      </UI.Card>
    );
  }
}

type OrderSummaryCardProps = { cart: Cart; manifest: string };

export class OrderSummaryCard extends PureComponent<OrderSummaryCardProps> {
  render() {
    const { cart, manifest } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.gutter }}>
        <UI.SectionHeader
          icon="inventory_2"
          title={`Order Summary (${cart.itemCount} items)`}
          trailing={<UI.Badge label={`Manifest ${manifest}`} tone="neutral" />}
        />
        {cart.lines.map((line) => (
          <UI.Row key={line.product.id} justify="space-between" align="flex-start" gap="sm">
            <UI.Stack flex={1}>
              <UI.Text variant="bodyStrong">
                {line.product.name} <UI.Text color="textMuted">× {line.quantity}</UI.Text>
              </UI.Text>
              <UI.Text variant="bodySm" color="textMuted">
                {line.product.supplier} • {line.product.packLabel}
              </UI.Text>
            </UI.Stack>
            <UI.Text variant="labelLg">{line.total.format()}</UI.Text>
          </UI.Row>
        ))}
        <UI.Divider />
        <UI.Row justify="space-between">
          <UI.Row gap="xs">
            <UI.Icon name="group" size={18} color={Palette.accent} />
            <UI.Text variant="bodyStrong" color="accent">
              Vuka Pool Volume Discount
            </UI.Text>
          </UI.Row>
          <UI.Text variant="labelLg" color="accent">
            {cart.poolDiscount.multiply(-1).format()}
          </UI.Text>
        </UI.Row>
        <UI.Row justify="space-between">
          <UI.Text variant="titleMd">Goods Subtotal</UI.Text>
          <UI.Text variant="headlineSm">{cart.subtotal.format()}</UI.Text>
        </UI.Row>
      </UI.Card>
    );
  }
}

export class LoadCard extends PureComponent<{ cart: Cart }> {
  render() {
    const { cart } = this.props;
    const load = cart.loadClass;
    return (
      <UI.Card tone="muted" padding="gutter">
        <UI.Row gap="gutter">
          <View style={styles.loadBadge}>
            <UI.Icon name="local_shipping" size={20} color={Palette.accentBright} />
            <UI.Text variant="labelSm" color="onBrand">
              {cart.weightKg} KG
            </UI.Text>
          </View>
          <UI.Stack flex={1}>
            <UI.Text variant="bodyStrong">
              Load: {cart.weightKg} kg – {load.label} ({load.vehicle})
            </UI.Text>
            <UI.Text variant="bodySm" color="textMuted">
              Matched to local {load.vehicle.toLowerCase()} cargo space for fast neighbourhood drop-offs.
            </UI.Text>
          </UI.Stack>
        </UI.Row>
      </UI.Card>
    );
  }
}

type DeliveryOptionCardProps = {
  option: DeliveryOption;
  selected: boolean;
  onSelect: (option: DeliveryOption) => void;
};

export class DeliveryOptionCard extends PureComponent<DeliveryOptionCardProps> {
  render() {
    const { option, selected, onSelect } = this.props;
    return (
      <UI.Card onPress={() => onSelect(option)} selected={selected} tone="outline" padding="gutter">
        <UI.Row gap="gutter" align="flex-start">
          <View style={[styles.radio, selected && styles.radioOn]}>
            {selected && <UI.Icon name="check" size={16} color={Palette.onAccent} />}
          </View>
          <UI.Stack flex={1} gap="xxs">
            <UI.Text variant="titleMd">{option.title}</UI.Text>
            <UI.Text variant="labelSm" color="accent" uppercase>
              {option.tag}
            </UI.Text>
            <UI.Text variant="bodySm" color="textMuted">
              {option.detail}
            </UI.Text>
          </UI.Stack>
          <UI.Text variant="headlineSm" color={option.fee.isZero ? 'accent' : 'text'}>
            {option.feeLabel}
          </UI.Text>
        </UI.Row>
      </UI.Card>
    );
  }
}

type PaymentMethodGridProps = {
  methods: readonly PaymentMethod[];
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
};

export class PaymentMethodGrid extends PureComponent<PaymentMethodGridProps> {
  render() {
    const { methods, selected, onSelect } = this.props;
    return (
      <View style={styles.grid} accessibilityRole="radiogroup">
        {methods.map((method) => {
          const active = method.id === selected;
          return (
            <Pressable
              key={method.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onSelect(method.id)}
              style={({ pressed }) => [
                styles.payment,
                { backgroundColor: active ? Palette.brand : Palette.surfaceContainer },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}>
              <UI.Icon name={method.icon} size={20} color={active ? Palette.accentBright : Palette.textMuted} />
              <UI.Text variant="labelMd" color={active ? 'onBrand' : 'text'} style={{ flex: 1 }} numberOfLines={1}>
                {method.label}
              </UI.Text>
              {active && <UI.Icon name="check_circle" size={18} color={Palette.accentBright} />}
            </Pressable>
          );
        })}
      </View>
    );
  }
}

export class PriceBreakdown extends PureComponent<{ quote: CheckoutQuote }> {
  private renderRow(label: string, value: string, accent = false) {
    return (
      <UI.Row justify="space-between">
        <UI.Text color="textMuted">{label}</UI.Text>
        <UI.Text variant="bodyStrong" color={accent ? 'accent' : 'text'}>
          {value}
        </UI.Text>
      </UI.Row>
    );
  }

  render() {
    const { quote } = this.props;
    return (
      <UI.Card style={{ gap: Spacing.sm }}>
        {this.renderRow(`Subtotal (${quote.cart.itemCount} items)`, quote.cart.subtotal.format({ cents: true }))}
        {this.renderRow(
          `Delivery Fee • ${quote.delivery.summaryLabel}`,
          quote.deliveryFee.isZero ? 'Free' : quote.deliveryFee.format({ cents: true }),
          quote.deliveryFee.isZero,
        )}
        {this.renderRow('Impelo Escrow Protection', 'Free', true)}
        <UI.Divider />
        <UI.Row justify="space-between" align="flex-end">
          <UI.Stack>
            <UI.Text variant="titleMd">Total Amount</UI.Text>
            <UI.Text variant="bodySm" color="textMuted">
              Incl. {quote.vatIncluded.format()} VAT & escrow guarantee
            </UI.Text>
          </UI.Stack>
          <UI.Text variant="display" color="brand">
            {quote.total.format()}
          </UI.Text>
        </UI.Row>
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  loadBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Palette.brand,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 2,
    borderWidth: 2,
    borderColor: Palette.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: Palette.accent, borderColor: Palette.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  payment: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.md,
  },
});
