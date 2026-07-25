import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES,
  isSupportedCurrency,
} from '@/shared/domain';

// Re-exported so screens can keep importing the currency vocabulary from here.
export { SUPPORTED_CURRENCIES, isSupportedCurrency };
export type { CurrencyCode };

/** First launch: preselect from the device locale; a persisted choice wins after that. */
function detectCurrency(): CurrencyCode {
  const detected = getLocales()[0]?.currencyCode;
  if (detected && isSupportedCurrency(detected)) {
    return detected;
  }
  return 'USD';
}

type State = {
  currency: CurrencyCode;
};

type Actions = {
  setCurrency: (currency: CurrencyCode) => void;
  /** Adopt the server's currency, ignoring codes this build doesn't support. */
  syncFromServer: (code: string) => void;
};

/** The user's home currency, picked at onboarding (free, core). */
export const useCurrencyStore = create<State & Actions>()(
  persist(
    (set) => ({
      currency: detectCurrency(),
      setCurrency: (currency) => set({ currency }),
      syncFromServer: (code) => {
        if (isSupportedCurrency(code)) set({ currency: code });
      },
    }),
    {
      name: 'deshka.currency',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
