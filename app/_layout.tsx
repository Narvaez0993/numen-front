import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemedStatusBar } from '@/shared/presentation/components';
import { AppProviders } from '@/shared/presentation/providers';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <ThemedStatusBar />
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </SafeAreaProvider>
  );
}
