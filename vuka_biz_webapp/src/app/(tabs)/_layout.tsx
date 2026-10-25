import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { UI, type IconName } from '@/components/ui';
import { AuthStore } from '@/services/AuthStore';
import { useStore } from '@/services/ObservableStore';
import { FontFamily, MaxContentWidth, Palette, Shadow, Spacing } from '@/theme/tokens';

class TabSpec {
  constructor(
    readonly name: string,
    readonly title: string,
    readonly icon: IconName,
  ) {}
}

/** Bottom navigation, in the order from the mockups. */
const TABS: readonly TabSpec[] = [
  new TabSpec('index', 'Shop', 'storefront'),
  new TabSpec('safe', 'Vuka Safe', 'verified_user'),
  new TabSpec('orders', 'Orders', 'receipt_long'),
  new TabSpec('books', 'Books', 'menu_book'),
  new TabSpec('driver', 'Driver', 'local_shipping'),
];

export default function TabLayout() {
  const { user } = useStore(AuthStore.instance);
  const { width } = useWindowDimensions();

  // On wide screens keep the tabs inside the same column as the page content.
  const sidePadding = Math.max(0, (width - (MaxContentWidth + Spacing.gutter * 2)) / 2);

  // Drivers land on their dispatch hub instead of the marketplace.
  useEffect(() => {
    if (user?.role === 'driver') router.navigate('/driver');
  }, [user?.role]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Wide screens otherwise switch to labels beside the icons.
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: Palette.accent,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarLabelStyle: { fontFamily: FontFamily.display, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: Palette.surfaceLowest,
          borderTopWidth: 0,
          boxShadow: Shadow.bar,
          paddingHorizontal: sidePadding,
          ...(Platform.OS === 'web' && { height: 64 }),
        },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <UI.Icon name={tab.icon} size={24} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
