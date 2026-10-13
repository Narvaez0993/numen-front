import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_PALETTE, type PaletteId } from './palettes';

type State = {
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
};

/**
 * Which accent the app wears. Its own axis, separate from night/day: the design's
 * Perfil screen offers both at once, and picking "Jade" should not disturb whether
 * the user reads on paper or on black.
 *
 * Stored on the device for now. It belongs in the server's preferences alongside
 * `theme` — a look that resets on reinstall is not a preference — but that is a
 * backend change, and this stage is meant to touch none.
 */
export const usePalettePreference = create<State>()(
  persist(
    (set) => ({
      palette: DEFAULT_PALETTE,
      setPalette: (palette) => set({ palette }),
    }),
    {
      name: 'deshka.palette-preference',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
