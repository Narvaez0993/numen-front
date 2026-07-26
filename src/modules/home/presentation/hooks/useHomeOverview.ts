import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { HomeOverview } from '../../domain/types/HomeOverview';

/** Anything that mutates money invalidates this key (see `invalidateMoneyViews`). */
export const HOME_KEY = ['home'] as const;

/**
 * `today` is part of the key: crossing midnight is a different question, not a
 * stale answer to the same one.
 */
export function useHomeOverview(today: string) {
  return useQuery<HomeOverview>({
    queryKey: [...HOME_KEY, 'overview', today],
    queryFn: () => container.getHomeOverviewUseCase.execute(today),
  });
}
