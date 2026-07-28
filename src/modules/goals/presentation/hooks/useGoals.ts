import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { GoalsSnapshot } from '../../domain';

export const GOALS_KEY = MONEY_VIEW_KEYS.goals;

/**
 * `today` is part of the key: the pace projection is derived by the server for that
 * day, so crossing midnight is a different question, not a stale answer.
 */
export function useGoals(today: string) {
  return useQuery<GoalsSnapshot>({
    queryKey: [...GOALS_KEY, 'snapshot', today],
    queryFn: () => container.getGoalsUseCase.execute(today),
  });
}
