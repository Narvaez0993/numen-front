import type { QueryClient } from '@tanstack/react-query';

/**
 * Every cached view that shows money, in one place.
 *
 * They are listed here rather than in each module because they are already coupled
 * by a fact of the domain: **Home embeds all of them**. Its payload carries the net
 * balance, the month, the daily figure, the top categories and the upcoming charges,
 * so a change in any module goes stale on a screen that module has never heard of.
 *
 * That is not hypothetical — it is the bug this file exists to prevent: creating an
 * account invalidated the accounts view but not Home, so a user who had just added
 * their first account in the onboarding landed on a "create your first account"
 * checklist with a $0 net balance, while the accounts strip right below it showed the
 * account and its balance.
 */
export const MONEY_VIEW_KEYS = {
  home: ['home'],
  accounts: ['accounts', 'overview'],
  movements: ['movements'],
  categories: ['categories', 'overview'],
  subscriptions: ['subscriptions'],
  budgets: ['budgets'],
  debts: ['deudas'],
  goals: ['goals'],
} as const;

/**
 * Refresh every money view. Deliberately **not surgical**: these are small cached
 * reads, and the cost of one extra refetch is nothing next to the cost of a screen
 * quietly showing a number that is no longer true. Anything that mutates money —
 * a movement, an account, a category, a subscription charge — calls this.
 */
export function invalidateMoneyViews(queryClient: QueryClient): void {
  for (const queryKey of Object.values(MONEY_VIEW_KEYS)) {
    void queryClient.invalidateQueries({ queryKey });
  }
}
