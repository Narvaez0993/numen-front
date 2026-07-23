import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { ThemedStatusBar } from '@/shared/presentation/components';
import { AppProviders } from '@/shared/presentation/providers';
import { useTheme } from '@/shared/presentation/theme';

function OnboardingGate() {
  const segments = useSegments();
  const router = useRouter();
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const completed = useOnboardingStore((s) => s.completed);
  const { theme } = useTheme();

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === '(onboarding)';
    if (!completed && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (completed && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hydrated, completed, segments, router]);

  if (hydrated) return null;

  // Solid cover during the AsyncStorage rehydration window. Prevents the
  // default /(tabs) route from flashing under returning users (when the
  // gate is about to send them to home) or under new users (when the gate
  // is about to send them to /(onboarding)).
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
      <OnboardingGate />
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
