import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { OnboardingProfileDTO } from '../../application';

type State = {
  completed: boolean;
  hydrated: boolean;
  profile: OnboardingProfileDTO | null;
  markCompleted: (profile: OnboardingProfileDTO) => void;
  reset: () => void;
};

export const useOnboardingStore = create<State>()(
  persist(
    (set) => ({
      completed: false,
      hydrated: false,
      profile: null,
      markCompleted: (profile) => set({ completed: true, profile }),
      reset: () => set({ completed: false, profile: null }),
    }),
    {
      name: 'numen.onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ completed: state.completed, profile: state.profile }),
      onRehydrateStorage: () => () => {
        // Triggers re-renders for subscribers reading `hydrated`.
        useOnboardingStore.setState({ hydrated: true });
      },
    },
  ),
);
