import { type QueryClient, useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { MovementsQuery } from '../../application';
import type { Movement } from '../../domain';

/** Anything that mutates money invalidates this domain. */
export const MOVEMENTS_KEY = ['movements'] as const;

/**
 * A movement changes three views at once: the list, the balances it moved and the
 * spend of its category. Create, edit and delete all fan out the same way, so the
 * fan-out lives here once.
 */
export function invalidateMoneyViews(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: MOVEMENTS_KEY });
  void queryClient.invalidateQueries({ queryKey: ['accounts', 'overview'] });
  void queryClient.invalidateQueries({ queryKey: ['categories', 'overview'] });
}

export function useMovements(query: MovementsQuery) {
  return useQuery<Movement[]>({
    // The range is part of the key: switching months is a different query, not a
    // refetch of the same one.
    queryKey: [...MOVEMENTS_KEY, 'list', query.from ?? null, query.to ?? null],
    queryFn: () => container.getMovementsUseCase.execute(query),
  });
}
