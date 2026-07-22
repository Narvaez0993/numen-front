import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SUPPORTED_CURRENCIES = ['COP', 'USD', 'EUR', 'MXN'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

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
      currency: 'COP',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'numen.currency',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
