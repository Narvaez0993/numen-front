import { create } from 'zustand';

export type PlanTier = 'free' | 'plus';

/**
 * UI-state only: which tier the interface should assume until billing (Fase 5)
 * brings the real entitlement. The AI usage counters left this store the day
 * the server started counting — `useAssistantUsage` is the meter's source now.
 */
type State = {
  tier: PlanTier;
};

type Actions = {
  activatePlus: () => void;
  downgradeToFree: () => void;
};

export const usePlanStore = create<State & Actions>((set) => ({
  tier: 'free',

  activatePlus: () => set({ tier: 'plus' }),
  downgradeToFree: () => set({ tier: 'free' }),
}));
