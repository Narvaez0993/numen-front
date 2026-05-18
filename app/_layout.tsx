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
      router.replace('/');
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

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <ThemedStatusBar />
        <Stack screenOptions={{ headerShown: false }} />
        <OnboardingGate />
      </AppProviders>
    </SafeAreaProvider>
  );
}
