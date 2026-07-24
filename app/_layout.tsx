import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setOnSessionExpired } from '@/core/di/container';
import { useAuthStore } from '@/modules/auth/presentation';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { ThemedStatusBar } from '@/shared/presentation/components';
import { AppProviders } from '@/shared/presentation/providers';
import { useTheme } from '@/shared/presentation/theme';

/**
 * Single gate for both session and onboarding state. Waits for both stores to
 * rehydrate, then routes to the right group. A failed token refresh clears the
 * session (via the registered handler) and this gate sends the user to login.
 */
function RootGate() {
  const segments = useSegments();
  const router = useRouter();
  const { theme } = useTheme();

  const authHydrated = useAuthStore((s) => s.hydrated);
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clear);
  const onbHydrated = useOnboardingStore((s) => s.hydrated);
  const completed = useOnboardingStore((s) => s.completed);

  const ready = authHydrated && onbHydrated;

  useEffect(() => {
    setOnSessionExpired(() => clearSession());
    return () => setOnSessionExpired(() => {});
  }, [clearSession]);

  useEffect(() => {
    if (!ready) return;
    const group = segments[0];
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (!session) {
      // Both (onboarding) and (auth) are valid without a session — the latter
      // is reachable mid-onboarding via "I already have an account". Only
      // redirect when the user landed somewhere else (e.g. a stale tabs URL).
      if (!inOnboarding && !inAuth) {
        router.replace(completed ? '/(auth)/login' : '/(onboarding)');
      }
    } else if (!completed && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (completed && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [ready, session, completed, segments, router]);

  if (ready) return null;

  // Solid cover during the AsyncStorage rehydration window. Prevents the
  // default /(tabs) route from flashing before the gate decides where to send
  // the user.
  return (
    <View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: theme.colors.bgBase, zIndex: 9999 },
      ]}
    />
  );
}

/**
 * Feeds the app theme into React Navigation so freshly-mounted screens and
 * stack cards paint with the app background instead of the default white
 * (kills the first-visit white flash between views).
 */
function RootNavigator() {
  const { theme, mode } = useTheme();
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.bgBase,
      card: theme.colors.bgBase,
      border: theme.colors.borderSubtle,
      primary: theme.colors.accentMint,
      text: theme.colors.textPrimary,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <ThemedStatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bgBase },
        }}
      />
      <RootGate />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </SafeAreaProvider>
  );
}
