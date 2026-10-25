import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { UI, type Toast } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import type { Product, ProductCategoryId } from '@/models';
import { AuthStore } from '@/services/AuthStore';
import { CartStore } from '@/services/CartStore';
import { ContactService } from '@/services/ContactService';
import { useStore } from '@/services/ObservableStore';
import { Palette, Spacing } from '@/theme/tokens';

type Filter = ProductCategoryId | 'all';

export default function ShopScreen() {
  const { user } = useStore(AuthStore.instance);
  const { cart } = useStore(CartStore.instance);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const toast = useRef<Toast>(null);

  const products = MockDatabase.products.filter(
    (p) => (filter === 'all' || p.category === filter) && p.matches(query),
  );

  const changeQuantity = (product: Product, quantity: number) => {
    const before = cart.quantityOf(product.id);
    CartStore.instance.setQuantity(product, quantity);
    if (quantity === 0) toast.current?.show(`Removed ${product.name}`, 'remove');
    else if (before === 0) toast.current?.show(`Added ${product.name} to pooled order`);
    else toast.current?.show(`${product.name}: ${quantity} in crate`);
  };

  const openSupport = async () => {
    const opened = await ContactService.whatsApp(MockDatabase.supportHotline, 'Sawubona Vuka Biz, I need help with my order.');
    if (!opened) toast.current?.show('WhatsApp is not available on this device.', 'warning');
  };

  return (
    <UI.Screen
      inTabs
      header={{
        title: 'Spaza Marketplace',
        avatarInitials: user?.initials,
        actions: [{ icon: 'notifications', label: 'Notifications', badge: true, onPress: () => toast.current?.show('No new notifications', 'notifications') }],
      }}
      footer={<Vuka.CartBar cart={cart} onPress={() => router.push('/checkout')} />}
      overlay={<UI.Toast ref={toast} bottomOffset={96} />}>
      <Vuka.WelcomeBanner shop={MockDatabase.shop} onSupport={openSupport} />

      <UI.TextField
        icon="search"
        placeholder="Search stock… (bread, cabbage, maize meal)"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        accessibilityLabel="Search stock items"
        trailing={
          query ? (
            <UI.Button label="Clear" size="sm" variant="secondary" onPress={() => setQuery('')} />
          ) : (
            <UI.Icon name="barcode_scanner" size={22} color={Palette.textMuted} />
          )
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroller}
        accessibilityRole="tablist">
        <UI.Chip label="All" icon="storefront" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {MockDatabase.categories.map((category) => (
          <UI.Chip
            key={category.id}
            label={category.label}
            icon={category.icon}
            selected={filter === category.id}
            onPress={() => setFilter(category.id)}
          />
        ))}
      </ScrollView>

      <UI.SectionHeader
        title="Wholesale Crates"
        trailing={
          <UI.Row gap="xs">
            <UI.Badge label={`${products.length} Deals`} tone="accent" />
            <UI.Text variant="bodySm" color="textMuted">
              Zone 4 Pooled Rates
            </UI.Text>
          </UI.Row>
        }
      />

      {products.length === 0 ? (
        <UI.Card tone="muted" style={styles.empty}>
          <UI.Icon name="search" size={32} color={Palette.outline} />
          <UI.Text variant="titleMd">No stock matches “{query}”</UI.Text>
          <UI.Text variant="bodySm" color="textMuted" align="center">
            Try another word or browse a different category.
          </UI.Text>
        </UI.Card>
      ) : (
        products.map((product) => (
          <Vuka.ProductCard
            key={product.id}
            product={product}
            quantity={cart.quantityOf(product.id)}
            onChangeQuantity={changeQuantity}
          />
        ))
      )}
      <View style={{ height: Spacing.sm }} />
    </UI.Screen>
  );
}

const styles = StyleSheet.create({
  chipScroller: { marginHorizontal: -Spacing.gutter, flexGrow: 0 },
  chips: { gap: Spacing.xs, paddingHorizontal: Spacing.gutter, paddingVertical: 2 },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
});
