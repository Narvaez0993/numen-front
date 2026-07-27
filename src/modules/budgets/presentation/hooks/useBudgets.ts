import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { BudgetsSnapshot } from '../../domain';

export const BUDGETS_KEY = MONEY_VIEW_KEYS.budgets;

/**
 * `today` is part of the key: the daily ceiling divides by the days that are left, so
 * crossing midnight is a different question, not a stale answer to the same one.
 */
export function useBudgets(today: string) {
  return useQuery<BudgetsSnapshot>({
    queryKey: [...BUDGETS_KEY, 'snapshot', today],
    queryFn: () => container.getBudgetsUseCase.execute(today),
  });
}
