import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createSubscriptionUseCase,
  deleteSubscriptionUseCase,
  updateSubscriptionUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { NewSubscription, Subscription, SubscriptionPatch } from '../../domain';

type UpdateInput = { id: string; patch: SubscriptionPatch };

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
    onSuccess: () => invalidateMoneyViews(queryClient),
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
    onSuccess: () => invalidateMoneyViews(queryClient),
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
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
