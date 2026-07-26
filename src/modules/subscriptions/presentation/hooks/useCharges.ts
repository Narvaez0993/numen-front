import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { container, settleChargeUseCase } from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { SubscriptionCharge } from '../../domain';

import { SUBSCRIPTIONS_KEY } from './useSubscriptions';

export function useCharges(status?: string) {
  return useQuery<SubscriptionCharge[]>({
    queryKey: [...SUBSCRIPTIONS_KEY, 'charges', status ?? null],
    queryFn: () => container.getChargesUseCase.execute(status),
  });
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
    onSuccess: () => invalidateMoneyViews(queryClient),
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
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
