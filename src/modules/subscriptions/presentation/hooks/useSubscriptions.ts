import { type QueryClient, useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { SubscriptionsOverview } from '../../domain';

/** Anything that changes a subscription or one of its charges invalidates this. */
export const SUBSCRIPTIONS_KEY = ['subscriptions'] as const;

export function invalidateSubscriptions(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
}

/**
 * `today` is part of the key: `nextChargeOn` is derived by the server for that day,
 * so crossing midnight is a different question, not a stale answer to the same one.
 */
export function useSubscriptions(today: string) {
  return useQuery<SubscriptionsOverview>({
    queryKey: [...SUBSCRIPTIONS_KEY, 'overview', today],
    queryFn: () => container.getSubscriptionsUseCase.execute(today),
  });
}
