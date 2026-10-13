import type { CurrencyCode } from '@/shared/domain';

export type BillingPeriod = 'mensual' | 'anual';

/**
 * What Plus costs.
 *
 * Prices are **minor units in the store's currency**, not in the user's home
 * currency: the plan is sold globally in USD and what the store will charge is
 * what the screen has to say. Formatting it as COP because the user keeps their
 * books in pesos would be off by a factor of four thousand.
 *
 * Only the two prices and the trial are stored. Everything else the paywall
 * shows — what a year works out to per month, how much it saves — is derived, so
 * a price change cannot leave a stale claim next to a fresh number.
 */
export type PlusOffer = {
  currency: CurrencyCode;
  /** Minor units, like every other amount in the app: `799` is US$7.99. */
  monthly: number;
  annual: number;
  /** Days of trial, free and without a card. */
  trialDays: number;
};

/** What the yearly price works out to per month, in minor units. */
export function perMonth(offer: PlusOffer): number {
  return Math.round(offer.annual / 12);
}

/** How much the year saves against twelve months, in whole percent. */
export function annualSavingPercent(offer: PlusOffer): number {
  return Math.round((1 - offer.annual / (offer.monthly * 12)) * 100);
}
