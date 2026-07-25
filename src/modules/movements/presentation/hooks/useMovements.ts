import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { MovementsQuery } from '../../application';
import type { Movement } from '../../domain';

/** Anything that mutates money invalidates this domain. */
export const MOVEMENTS_KEY = ['movements'] as const;

export function useMovements(query: MovementsQuery) {
  return useQuery<Movement[]>({
    // The range is part of the key: switching months is a different query, not a
    // refetch of the same one.
    queryKey: [...MOVEMENTS_KEY, 'list', query.from ?? null, query.to ?? null],
    queryFn: () => container.getMovementsUseCase.execute(query),
  });
}
