import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SUPPORTED_CURRENCIES = ['COP', 'USD', 'EUR', 'MXN'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** First launch: preselect from the device locale; a persisted choice wins after that. */
function detectCurrency(): CurrencyCode {
  const detected = getLocales()[0]?.currencyCode;
  if (detected && (SUPPORTED_CURRENCIES as readonly string[]).includes(detected)) {
    return detected as CurrencyCode;
  }
  return 'USD';
}

type State = {
  currency: CurrencyCode;
};

type Actions = {
  setCurrency: (currency: CurrencyCode) => void;
};

/** The user's home currency, picked at onboarding (free, core). */
export const useCurrencyStore = create<State & Actions>()(
  persist(
    (set) => ({
      currency: detectCurrency(),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'numen.currency',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
