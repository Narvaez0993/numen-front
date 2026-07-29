import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';
import { MONEY_VIEW_KEYS } from '@/shared/presentation/query/moneyViews';

import type { DebtsSnapshot } from '../../domain';

export const DEBTS_KEY = MONEY_VIEW_KEYS.debts;

/**
 * `today` is part of the key: `status` — and with it `overdue` — is derived by the
 * server for that day, so crossing midnight is a different question, not a stale
 * answer to the same one.
 */
export function useDeudas(today: string) {
  return useQuery<DebtsSnapshot>({
    queryKey: [...DEBTS_KEY, 'snapshot', today],
    queryFn: () => container.getDeudasUseCase.execute(today),
  });
}
