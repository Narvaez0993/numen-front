import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { SubscriptionsOverview } from '../../domain';

export const SUBSCRIPTIONS_KEY = MONEY_VIEW_KEYS.subscriptions;

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
