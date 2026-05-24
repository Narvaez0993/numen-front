import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type HeroVariant = 'daily' | 'saldo' | 'mes';

type State = {
  variant: HeroVariant;
  setVariant: (variant: HeroVariant) => void;
};

export const useHeroVariantStore = create<State>()(
  persist(
    (set) => ({
      variant: 'daily',
      setVariant: (variant) => set({ variant }),
    }),
    {
      name: 'numen.hero-variant',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
