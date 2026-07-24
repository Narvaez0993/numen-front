import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { OnboardingProfileDTO } from '../../application';

type State = {
  // Device-local flags. Persisted to AsyncStorage: they survive logout and are
  // wiped only on reinstall (which is exactly when onboarding should replay).
  introSeen: boolean; // welcome hook seen → decides welcome vs login
  profileDone: boolean; // setup #2 done (or logged in) → decides setup vs tabs
  hydrated: boolean;
  profile: OnboardingProfileDTO | null;
  markIntroSeen: () => void;
  markCompleted: (profile: OnboardingProfileDTO) => void;
  updateName: (name: string) => void;
  reset: () => void;
  hardReset: () => void;
};

export const useOnboardingStore = create<State>()(
  persist(
    (set) => ({
      introSeen: false,
      profileDone: false,
      hydrated: false,
      profile: null,
      markIntroSeen: () => set({ introSeen: true }),
      markCompleted: (profile) => set({ profileDone: true, profile }),
      updateName: (name) =>
        set((s) => (s.profile ? { profile: { ...s.profile, name } } : s)),
      // Clears the setup so a fresh registration replays it; keeps `introSeen`
      // (used by "create account" from login).
      reset: () => set({ profileDone: false, profile: null }),
      // Full replay from the welcome hook (dev-only affordance).
      hardReset: () => set({ introSeen: false, profileDone: false, profile: null }),
    }),
    {
      name: 'deshka.onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        introSeen: state.introSeen,
        profileDone: state.profileDone,
        profile: state.profile,
      }),
      onRehydrateStorage: () => () => {
        // Triggers re-renders for subscribers reading `hydrated`.
        useOnboardingStore.setState({ hydrated: true });
      },
    },
  ),
);
