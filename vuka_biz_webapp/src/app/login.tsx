import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UI, type TextField, type Toast } from '@/components/ui';
import type { Segment } from '@/components/ui/SegmentedControl';
import { Vuka } from '@/components/vuka';
import { MockDatabase } from '@/data/MockDatabase';
import type { UserRole } from '@/models';
import { AuthStore } from '@/services/AuthStore';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/theme/tokens';

const ROLES: readonly Segment<UserRole>[] = [
  { value: 'owner', label: 'Spaza Owner', icon: 'storefront' },
  { value: 'driver', label: 'Driver', icon: 'local_shipping' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: UserRole }>();
  const [role, setRole] = useState<UserRole>(params.role === 'driver' ? 'driver' : 'owner');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pinField = useRef<TextField>(null);
  const toast = useRef<Toast>(null);

  const canSubmit = phone.trim().length > 0 && pin.length === 4 && !loading;

  const fillDemo = () => {
    const demo = MockDatabase.users.find((u) => u.role === role)!;
    setPhone(demo.phone);
    setPin(MockDatabase.demoPin);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    const result = await AuthStore.instance.login(phone, pin, role);
    // On success the root layout's Stack.Protected guard swaps to the tabs.
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
            style={styles.back}>
            <UI.Icon name="arrow_back" size={26} color={Palette.onBrand} />
          </Pressable>

          <View style={styles.brand}>
            <Vuka.BrandMark />
          </View>

          <Animated.View entering={FadeInDown.duration(350)}>
            <UI.Card padding="lg" radius="xl" style={styles.card}>
              <UI.Stack gap="xxs">
                <UI.Text variant="headlineLg">Welcome back</UI.Text>
                <UI.Text color="textMuted">Log in with your cellphone number and 4-digit Vuka PIN.</UI.Text>
              </UI.Stack>

              <UI.SegmentedControl segments={ROLES} value={role} onChange={setRole} />

              <UI.TextField
                label="Cellphone number"
                icon="smartphone"
                placeholder="071 234 5678"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  setError(null);
                }}
                onSubmitEditing={() => pinField.current?.focus()}
              />

              <UI.TextField
                ref={pinField}
                label="Vuka PIN"
                icon="lock"
                placeholder="••••"
                keyboardType="number-pad"
                maxLength={4}
                secret
                value={pin}
                onChangeText={(t) => {
                  setPin(t.replace(/\D/g, ''));
                  setError(null);
                }}
                onSubmitEditing={() => canSubmit && submit()}
                error={error ?? undefined}
              />

              <UI.Button
                label={loading ? 'Verifying…' : 'Log in'}
                size="lg"
                variant="brand"
                loading={loading}
                disabled={!canSubmit}
                onPress={submit}
                fullWidth
              />

              <UI.Row justify="space-between">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toast.current?.show('A reset PIN would be sent to you by SMS.', 'smartphone')}>
                  <UI.Text variant="labelMd" color="accent">
                    Forgot PIN?
                  </UI.Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={fillDemo}>
                  <UI.Text variant="labelMd" color="accent">
                    Use demo account
                  </UI.Text>
                </Pressable>
              </UI.Row>
            </UI.Card>
          </Animated.View>

          <View style={styles.demo}>
            <UI.Icon name="help" size={18} color={Palette.accentBright} />
            <UI.Text variant="bodySm" color="brandMuted" style={{ flex: 1 }}>
              Demo: owner 071 234 5678 • driver 082 345 6789 • PIN{' '}
              <UI.Text variant="bodyStrong" color="accentBright" style={{ fontSize: 12 }}>
                {MockDatabase.demoPin}
              </UI.Text>
              .
            </UI.Text>
          </View>
        </View>
      </ScrollView>
      <UI.Toast ref={toast} bottomOffset={insets.bottom + Spacing.lg} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.brand },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.md },
  column: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.lg },
  back: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center' },
  card: { gap: Spacing.md },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.gutter,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(79, 99, 89, 0.28)',
  },
});
