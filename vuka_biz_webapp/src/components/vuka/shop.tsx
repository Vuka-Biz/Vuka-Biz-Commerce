import { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { UI } from '@/components/ui';
import type { Cart, Product, Shop, Tone } from '@/models';
import { Palette, type PaletteColor, Radius, Shadow, Spacing } from '@/theme/tokens';

const toneText: Record<Tone, PaletteColor> = {
  accent: 'accent',
  amber: 'amberText',
  brand: 'brand',
  danger: 'error',
  neutral: 'outline',
};

type WelcomeBannerProps = { shop: Shop; onSupport: () => void };

export class WelcomeBanner extends PureComponent<WelcomeBannerProps> {
  render() {
    const { shop, onSupport } = this.props;
    return (
      <UI.Card tone="brand" style={{ gap: Spacing.gutter }}>
        <UI.Row justify="space-between" align="flex-start" gap="sm">
          <UI.Stack gap="xs" flex={1}>
            <UI.Row gap="xs">
              <UI.Badge label={shop.zone} icon="location_on" tone="brandOnDark" uppercase />
              <View style={styles.liveDot} />
            </UI.Row>
            <UI.Text variant="headlineMd" color="onBrand" numberOfLines={1}>
              Sawubona, {shop.name}
            </UI.Text>
            <UI.Text variant="bodySm" color="brandMuted">
              Trade Local. Scale Formal.
            </UI.Text>
          </UI.Stack>
          <UI.Button label="Buza" icon="chat" size="sm" onPress={onSupport} accessibilityLabel="Buza support on WhatsApp" />
        </UI.Row>
        <View style={styles.notice}>
          <UI.Icon name="local_shipping" size={20} color={Palette.accentBright} />
          <UI.Text variant="bodySm" color="onBrand" style={{ flex: 1 }}>
            <UI.Text variant="bodyStrong" color="accentBright" style={{ fontSize: 12 }}>
              Next Route:{' '}
            </UI.Text>
            Order by 2pm for pooled delivery tomorrow morning.
          </UI.Text>
        </View>
      </UI.Card>
    );
  }
}

type ProductCardProps = {
  product: Product;
  quantity: number;
  onChangeQuantity: (product: Product, quantity: number) => void;
};

export class ProductCard extends PureComponent<ProductCardProps> {
  private add = () => this.props.onChangeQuantity(this.props.product, 1);
  private change = (qty: number) => this.props.onChangeQuantity(this.props.product, qty);

  private renderFootnote() {
    const { footnote } = this.props.product;
    const color = toneText[footnote.tone];
    return (
      <UI.Row gap="xs" flex={1}>
        {footnote.icon && <UI.Icon name={footnote.icon} size={16} color={Palette[color]} />}
        <UI.Text variant={footnote.tone === 'neutral' ? 'bodySm' : 'bodyStrong'} color={color} style={{ fontSize: 12 }}>
          {footnote.label}
        </UI.Text>
      </UI.Row>
    );
  }

  render() {
    const { product, quantity } = this.props;
    return (
      <UI.Card padding="sm" style={{ gap: Spacing.sm }}>
        <UI.Row align="stretch" gap="gutter">
          <View>
            <UI.NetImage
              uri={product.imageUrl}
              fallbackIcon={product.icon}
              style={styles.image}
              accessibilityLabel={product.name}
            />
            <View style={styles.packLabel}>
              <UI.Text variant="labelSm" color="accentBright">
                {product.packLabel}
              </UI.Text>
            </View>
          </View>
          <UI.Stack flex={1} justify="space-between" gap="xs">
            <UI.Stack gap="xxs">
              <UI.Row gap="xs">
                <UI.Badge label={product.sourceTag.label} tone={product.sourceTag.tone} pill={false} uppercase />
                <UI.Text variant="bodySm" color="textMuted" numberOfLines={1} style={{ flex: 1 }}>
                  {product.supplier}
                </UI.Text>
              </UI.Row>
              <UI.Text variant="titleMd" numberOfLines={2}>
                {product.name}
              </UI.Text>
              <UI.Text variant="bodySm" color="textMuted">
                {product.unitNote}
              </UI.Text>
            </UI.Stack>
            <UI.Row justify="space-between" gap="xs">
              <UI.Badge label={product.highlight.label} tone={product.highlight.tone} />
              <UI.Text variant="headlineSm" color="brand">
                {product.price.format()}
              </UI.Text>
            </UI.Row>
          </UI.Stack>
        </UI.Row>
        <UI.Row justify="space-between" gap="sm">
          {this.renderFootnote()}
          {quantity > 0 ? (
            <UI.Stepper value={quantity} onChange={this.change} label={product.name} />
          ) : (
            <UI.Button label="Add" icon="add" size="sm" onPress={this.add} accessibilityLabel={`Add ${product.name}`} />
          )}
        </UI.Row>
      </UI.Card>
    );
  }
}

type CartBarProps = { cart: Cart; onPress: () => void };

export class CartBar extends PureComponent<CartBarProps> {
  render() {
    const { cart, onPress } = this.props;
    return (
      <UI.Card tone="brand" padding="gutter" onPress={cart.isEmpty ? undefined : onPress} style={styles.cartBar}>
        <UI.Row gap="gutter">
          <View style={styles.cartIcon}>
            <UI.Icon name="shopping_cart" size={22} color={Palette.onAccent} />
            {!cart.isEmpty && (
              <View style={styles.cartCount}>
                <UI.Text variant="labelSm" color="brand">
                  {cart.itemCount}
                </UI.Text>
              </View>
            )}
          </View>
          <UI.Stack flex={1}>
            <UI.Text variant="labelMd" color="accentBright">
              {cart.isEmpty ? 'Your crate is empty' : `${cart.itemCount} items in crate`}
            </UI.Text>
            <UI.Text variant="headlineSm" color="onBrand">
              {cart.subtotal.format()} total
            </UI.Text>
          </UI.Stack>
          <UI.Row gap="xs">
            <UI.Text variant="labelLg" color={cart.isEmpty ? 'brandMuted' : 'onBrand'}>
              View Cart
            </UI.Text>
            <UI.Icon name="arrow_forward" size={20} color={cart.isEmpty ? Palette.brandMuted : Palette.accentBright} />
          </UI.Row>
        </UI.Row>
      </UI.Card>
    );
  }
}

const styles = StyleSheet.create({
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.accentSoft },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(79, 99, 89, 0.35)',
  },
  image: { width: 104, height: 104, borderRadius: Radius.md },
  packLabel: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(13, 31, 24, 0.9)',
  },
  cartBar: { boxShadow: Shadow.raised },
  cartIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: Palette.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
