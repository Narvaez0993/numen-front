import { useQuery } from '@tanstack/react-query';

import { summarizeMovementsUseCase } from '@/core/di/container';

import type { MovementsSummary } from '../../domain';

import { MOVEMENTS_KEY } from './useMovements';

/**
 * Period aggregates from the API. Lives under the movements key, so
 * `invalidateMoneyViews` already refreshes it when anything moves money.
 */
export function useMovementsSummary(range: { from: string; to: string }) {
  return useQuery<MovementsSummary>({
    queryKey: [...MOVEMENTS_KEY, 'summary', range.from, range.to],
    queryFn: () => summarizeMovementsUseCase.execute(range),
  });
}
