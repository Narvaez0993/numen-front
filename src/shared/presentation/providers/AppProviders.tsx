import {
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  useFonts,
} from '@expo-google-fonts/geist';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '../../infrastructure/i18n';
import { ThemeProvider } from '../theme';

void SplashScreen.preventAutoHideAsync();

type Props = { children: ReactNode };

export function AppProviders({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  // The four weights the design writes in: 300 for the big sentences, 400 for
  // text, 500 for figures and emphasis, 600 for buttons. A weight that is not
  // loaded does not fall back to a nearby one — it renders as 400.
  const [fontsLoaded] = useFonts({
    Geist_300Light,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
