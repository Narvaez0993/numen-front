import { create } from 'zustand';

type State = {
  hidden: boolean;
  toggle: () => void;
};

/**
 * The eye in Home's header: every figure on screen, hidden at once.
 *
 * Deliberately NOT persisted. Coming back to the app with your balances already
 * covered would be a state you have to remember turning on; this is for the moment
 * someone is beside you, and it ends with the session.
 */
export const usePrivacy = create<State>((set) => ({
  hidden: false,
  toggle: () => set((s) => ({ hidden: !s.hidden })),
}));
