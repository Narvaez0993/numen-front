import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import { SOURCE_COUNT_LIMIT, type SourceMovementCount } from '../../application';

import { MOVEMENTS_KEY } from './useMovements';

/**
 * The movements of one account or card, counted before it is deleted (HU-07).
 *
 * Asked only when there is a source to ask about — the moment the user asks to
 * delete it — and never cached across opens: a count from last week would be
 * a warning about a different history.
 */
export function useSourceMovementCount(sourceId: string | null): SourceMovementCount {
  const query = useQuery({
    queryKey: [...MOVEMENTS_KEY, 'bySource', sourceId],
    queryFn: () =>
      container.getMovementsUseCase.execute({
        sourceId: sourceId ?? undefined,
        limit: SOURCE_COUNT_LIMIT + 1,
      }),
    enabled: sourceId !== null,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const total = query.data?.length ?? 0;
  return {
    checking: sourceId !== null && query.isPending,
    count: Math.min(total, SOURCE_COUNT_LIMIT),
    more: total > SOURCE_COUNT_LIMIT,
    failed: query.isError,
  };
}
