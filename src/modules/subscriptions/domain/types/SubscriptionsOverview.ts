import type { Subscription } from './Subscription';

export type SubscriptionsOverview = {
  subscriptions: readonly Subscription[];
  monthly: number;
  yearly: number;
  count: number;
};
