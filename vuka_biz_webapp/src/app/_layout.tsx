import { PlusJakartaSans_500Medium, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthStore } from '@/services/AuthStore';
import { useStore } from '@/services/ObservableStore';
import { Palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Palette.surface, primary: Palette.accent },
};

/**
 * Route map
 *   welcome  → splash + welcome          (signed out)
 *   login    → phone + PIN login         (signed out)
 *   (tabs)   → Shop · Safe · Orders · Books · Driver   (signed in)
 *   checkout → cart checkout, pushed over the tabs     (signed in)
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });
  const { user } = useStore(AuthStore.instance);
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.surface } }}>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_bottom' }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
