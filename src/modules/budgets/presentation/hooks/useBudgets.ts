import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { BudgetsSnapshot } from '../../domain/types/Budget';

export function useBudgets() {
  return useQuery<BudgetsSnapshot>({
    queryKey: ['budgets', 'snapshot'],
    queryFn: () => container.getBudgetsUseCase.execute(),
  });
}
