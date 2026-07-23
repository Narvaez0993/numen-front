import { create } from 'zustand';

export type PlanTier = 'free' | 'plus';

export type UsageLimits = {
  registrations: number;
  messages: number;
};

export const PLAN_LIMITS: Record<PlanTier, UsageLimits> = {
  free: { registrations: 60, messages: 10 },
  plus: { registrations: 300, messages: 300 },
};

type State = {
  tier: PlanTier;
  used: UsageLimits;
};

type Actions = {
  activatePlus: () => void;
  downgradeToFree: () => void;
  consumeMessage: () => void;
  consumeRegistration: () => void;
};

export const usePlanStore = create<State & Actions>((set) => ({
  tier: 'free',
  // Mock month-to-date usage so the meters look lived-in.
  used: { registrations: 12, messages: 3 },

  activatePlus: () => set({ tier: 'plus' }),
  downgradeToFree: () => set({ tier: 'free' }),

  consumeMessage: () =>
    set((s) => ({ used: { ...s.used, messages: s.used.messages + 1 } })),

  consumeRegistration: () =>
    set((s) => ({ used: { ...s.used, registrations: s.used.registrations + 1 } })),
}));

export function limitsFor(tier: PlanTier): UsageLimits {
  return PLAN_LIMITS[tier];
}
