import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UI, type IconName } from '@/components/ui';
import { Vuka } from '@/components/vuka';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/theme/tokens';

const SPLASH_MS = 1600;

class Feature {
  constructor(
    readonly icon: IconName,
    readonly title: string,
    readonly body: string,
  ) {}
}

const FEATURES: readonly Feature[] = [
  new Feature('group', 'Pooled wholesale buying', 'Order with spazas on your route and pay farm-gate prices.'),
  new Feature('verified_user', 'Escrow-protected delivery', 'Money is released only after you inspect stock and share your PIN.'),
  new Feature('trending_up', 'Build your Vuka Score', 'Every verified trade grows your credit line – up to R50k asset finance.'),
];

/** Branded splash that settles into the welcome / onboarding screen. */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <Animated.View exiting={FadeOut.duration(250)} style={styles.splash}>
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          <Vuka.BrandMark size="lg" showTagline />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(500)} style={[styles.splashFooter, { bottom: insets.bottom + Spacing.xl }]}>
          <UI.Text variant="labelSm" color="brandMuted" uppercase>
            Powered by Impelo Pay escrow
          </UI.Text>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
            <Vuka.BrandMark />
            <UI.Text variant="headlineLg" color="onBrand" align="center" style={styles.headline}>
              Stock smarter.{'\n'}Deliver together.{'\n'}
              <UI.Text variant="headlineLg" color="accentBright">
                Grow formal.
              </UI.Text>
            </UI.Text>
            <UI.Text variant="bodyMd" color="brandMuted" align="center">
              The wholesale marketplace built for township spaza shops and the drivers who keep them stocked.
            </UI.Text>
          </Animated.View>

          <UI.Stack gap="sm">
            {FEATURES.map((feature, i) => (
              <Animated.View key={feature.title} entering={FadeInDown.delay(150 + i * 100).duration(400)}>
                <View style={styles.feature}>
                  <UI.IconTile icon={feature.icon} background={Palette.accent} color={Palette.onAccent} />
                  <UI.Stack flex={1} gap="xxs">
                    <UI.Text variant="titleMd" color="onBrand">
                      {feature.title}
                    </UI.Text>
                    <UI.Text variant="bodySm" color="brandMuted">
                      {feature.body}
                    </UI.Text>
                  </UI.Stack>
                </View>
              </Animated.View>
            ))}
          </UI.Stack>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.actions}>
            <UI.Button
              label="Get started"
              iconRight="arrow_forward"
              size="lg"
              onPress={() => router.push({ pathname: '/login', params: { role: 'owner' } })}
              fullWidth
            />
            <UI.Button
              label="I'm a Vuka driver"
              icon="local_shipping"
              variant="light"
              onPress={() => router.push({ pathname: '/login', params: { role: 'driver' } })}
              fullWidth
            />
            <UI.Text variant="bodySm" color="brandMuted" align="center">
              By continuing you agree to the Vuka Biz Terms & POPIA Privacy Notice.
            </UI.Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center' },
  splashFooter: { position: 'absolute' },
  root: { flex: 1, backgroundColor: Palette.brand },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg },
  column: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.lg, justifyContent: 'space-between' },
  hero: { alignItems: 'center', gap: Spacing.md },
  headline: { marginTop: Spacing.sm },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
    padding: Spacing.gutter,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(79, 99, 89, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(210, 231, 220, 0.08)',
  },
  actions: { gap: Spacing.gutter },
});
