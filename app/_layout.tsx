import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { ThemedStatusBar } from '@/shared/presentation/components';
import { AppProviders } from '@/shared/presentation/providers';

function OnboardingGate() {
  const segments = useSegments();
  const router = useRouter();
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const completed = useOnboardingStore((s) => s.completed);

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === '(onboarding)';
    if (!completed && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (completed && inOnboarding) {
      router.replace('/');
    }
  }, [hydrated, completed, segments, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <ThemedStatusBar />
        <OnboardingGate />
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </SafeAreaProvider>
  );
}
