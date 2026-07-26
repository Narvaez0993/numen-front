import type { CurrencyCode } from '@/shared/domain';

/**
 * - `pending` — due, waiting for the user to confirm;
 * - `confirmed` — the user said yes; a movement exists;
 * - `auto` — nobody answered within the window, so it was registered anyway;
 * - `skipped` — the user said it did not happen; no movement.
 */
export type ChargeStatus = 'pending' | 'confirmed' | 'auto' | 'skipped';

/**
 * One occurrence of a subscription, on the day it is due. Carries references only:
 * the name and icon come from the subscriptions catalog the client already caches.
 */
export type SubscriptionCharge = {
  id: string;
  subscriptionId: string;
  dueOn: string;
  amount: number;
  currency: CurrencyCode;
  status: ChargeStatus;
  movementId: string | null;
};
