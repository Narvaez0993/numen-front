import { create } from 'zustand';

import type { Subscription, SubscriptionsOverview } from '../../domain';

export type SubscriptionPatch = Partial<
  Pick<Subscription, 'name' | 'amount' | 'every' | 'account'>
>;

type State = {
  initialized: boolean;
  subscriptions: Subscription[];
};

type Actions = {
  init: (overview: SubscriptionsOverview) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, patch: SubscriptionPatch) => void;
  removeSubscription: (id: string) => void;
};

export const useSubscriptionsStore = create<State & Actions>((set) => ({
  initialized: false,
  subscriptions: [],

  init: (overview) =>
    set({ initialized: true, subscriptions: [...overview.subscriptions] }),

  addSubscription: (subscription) =>
    set((s) => ({ subscriptions: [...s.subscriptions, subscription] })),

  updateSubscription: (id, patch) =>
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...patch } : sub,
      ),
    })),

  removeSubscription: (id) =>
    set((s) => ({ subscriptions: s.subscriptions.filter((sub) => sub.id !== id) })),
}));
