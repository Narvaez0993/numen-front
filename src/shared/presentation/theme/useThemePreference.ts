import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'dark' | 'light' | 'auto';

type State = {
  mode: ThemePreference;
  setMode: (mode: ThemePreference) => void;
  cycle: () => void;
};

const NEXT: Record<ThemePreference, ThemePreference> = {
  dark: 'light',
  light: 'auto',
  auto: 'dark',
};

export const useThemePreference = create<State>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      setMode: (mode) => set({ mode }),
      cycle: () => set({ mode: NEXT[get().mode] }),
    }),
    {
      name: 'numen.theme-preference',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
