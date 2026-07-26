import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createSubscriptionUseCase,
  deleteSubscriptionUseCase,
  updateSubscriptionUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/modules/movements/presentation/hooks/useMovements';

import type { NewSubscription, Subscription, SubscriptionPatch } from '../../domain';

import { invalidateSubscriptions } from './useSubscriptions';

type UpdateInput = { id: string; patch: SubscriptionPatch };

/** A subscription changes the forecast, and Home shows the forecast. */
function refresh(queryClient: ReturnType<typeof useQueryClient>): void {
  invalidateSubscriptions(queryClient);
  invalidateMoneyViews(queryClient);
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, NewSubscription>({
    mutationFn: async (input) => {
      const result = await createSubscriptionUseCase.execute(input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => refresh(queryClient),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, UpdateInput>({
    mutationFn: async ({ id, patch }) => {
      const result = await updateSubscriptionUseCase.execute(id, patch);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => refresh(queryClient),
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteSubscriptionUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => refresh(queryClient),
  });
}
