import type { SourceRef } from '@/modules/movements/domain';
import type { AccentColor, CurrencyCode } from '@/shared/domain';

export type Frequency = 'weekly' | 'monthly' | 'yearly';

/**
 * A recurring charge the user expects — a **commitment**, not a fact. It never
 * moves money by itself: on the due date it opens a `SubscriptionCharge`, and only
 * that becomes a movement.
 *
 * `amount` is an integer in the minor unit of `currency`. The cadence is
 * `frequency` + `firstChargeOn` (an anchor date); `nextChargeOn` is **derived** by
 * the server for the day it was asked about, so nothing here can go stale. `null`
 * means paused.
 */
export type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  frequency: Frequency;
  firstChargeOn: string;
  nextChargeOn: string | null;
  source: SourceRef;
  categoryId: string | null;
  icon: string;
  color: AccentColor;
  active: boolean;
};

export type NewSubscription = {
  name: string;
  amount: number;
  frequency: Frequency;
  firstChargeOn: string;
  source: SourceRef;
  categoryId: string | null;
  icon?: string;
  color?: AccentColor;
};

/** Absent keys keep their stored value. `active: false` pauses the charges. */
export type SubscriptionPatch = {
  name?: string;
  amount?: number;
  frequency?: Frequency;
  firstChargeOn?: string;
  source?: SourceRef;
  categoryId?: string | null;
  icon?: string;
  color?: AccentColor;
  active?: boolean;
};
