import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type HomeLayout = 'actividad' | 'compacto';

type State = {
  layout: HomeLayout;
  setLayout: (layout: HomeLayout) => void;
};

export const useHomeLayoutStore = create<State>()(
  persist(
    (set) => ({
      layout: 'actividad',
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'numen.home-layout',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
