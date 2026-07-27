import type { CurrencyCode } from '@/shared/domain';

import type { Subscription } from './Subscription';

/**
 * The subscriptions screen in one read. `monthly` and `yearly` normalise every
 * frequency (weekly 52/12, yearly /12) so both totals mean the same thing for a gym
 * paid weekly and a domain paid once a year; paused ones are **listed but excluded
 * from the totals** — what you pay is what is running.
 */
export type SubscriptionsOverview = {
  currency: CurrencyCode;
  subscriptions: Subscription[];
  monthly: number;
  yearly: number;
  /** How many are running, not how many exist. */
  count: number;
};
