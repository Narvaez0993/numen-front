import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { MovementsQuery } from '../../application';
import type { Movement } from '../../domain';

export const MOVEMENTS_KEY = MONEY_VIEW_KEYS.movements;

// The fan-out used to live here, but a movement is not the only thing that moves
// money — see `shared/presentation/query/moneyViews.ts`.
export { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

export function useMovements(query: MovementsQuery) {
  return useQuery<Movement[]>({
    // The range is part of the key: switching months is a different query, not a
    // refetch of the same one.
    queryKey: [...MOVEMENTS_KEY, 'list', query.from ?? null, query.to ?? null],
    queryFn: () => container.getMovementsUseCase.execute(query),
  });
}
