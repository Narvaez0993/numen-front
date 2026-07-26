import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { container, settleChargeUseCase } from '@/core/di/container';
import { invalidateMoneyViews } from '@/modules/movements/presentation/hooks/useMovements';

import type { SubscriptionCharge } from '../../domain';

import { SUBSCRIPTIONS_KEY, invalidateSubscriptions } from './useSubscriptions';

export function useCharges(status?: string) {
  return useQuery<SubscriptionCharge[]>({
    queryKey: [...SUBSCRIPTIONS_KEY, 'charges', status ?? null],
    queryFn: () => container.getChargesUseCase.execute(status),
  });
}

/**
 * Settling a charge moves real money, so it invalidates the same views a movement
 * does — the balance, the month, the daily figure — plus the charge list itself.
 */
function refresh(queryClient: ReturnType<typeof useQueryClient>): void {
  invalidateSubscriptions(queryClient);
  invalidateMoneyViews(queryClient);
}

export function useConfirmCharge() {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionCharge, Error, { id: string; amount?: number }>({
    mutationFn: async ({ id, amount }) => {
      const result = await settleChargeUseCase.confirm(id, amount);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => refresh(queryClient),
  });
}

export function useSkipCharge() {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionCharge, Error, string>({
    mutationFn: async (id) => {
      const result = await settleChargeUseCase.skip(id);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => refresh(queryClient),
  });
}
