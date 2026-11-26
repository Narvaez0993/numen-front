import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { MovementsQuery } from '../../application';
import type { Movement } from '../../domain';

export const MOVEMENTS_KEY = MONEY_VIEW_KEYS.movements;

// The fan-out used to live here, but a movement is not the only thing that moves
// money — see `shared/presentation/query/moneyViews.ts`.
export { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

/**
 * The most the API hands over in one list, and what the history asks for (HU-23).
 *
 * Without it the API answers its default of 100, and a month with more than
 * that was cut off without a word: the oldest days of the month simply were not
 * there. A thousand movements is a month far beyond personal use.
 */
export const HISTORY_LIMIT = 1000;

export function useMovements(query: MovementsQuery) {
  const limit = query.limit ?? HISTORY_LIMIT;
  return useQuery<Movement[]>({
    // The range is part of the key: switching months is a different query, not a
    // refetch of the same one.
    queryKey: [...MOVEMENTS_KEY, 'list', query.from ?? null, query.to ?? null, limit],
    queryFn: () => container.getMovementsUseCase.execute({ ...query, limit }),
  });
}
