import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createBudgetUseCase,
  deleteBudgetUseCase,
  updateBudgetUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { Budget, NewBudget } from '../../domain';

/**
 * Every one of these refreshes **all** the money views, not just this screen: setting a
 * cap changes the hero of Home, which leads with it. That fan-out is the same one the
 * accounts bug taught us to use — a screen quietly showing a number that is no longer
 * true costs more than an extra refetch.
 */
export function useCreateBudget(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Budget, Error, NewBudget>({
    mutationFn: async (input) => {
      const result = await createBudgetUseCase.execute(input, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useUpdateBudget(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Budget, Error, { id: string; target: number }>({
    mutationFn: async ({ id, target }) => {
      const result = await updateBudgetUseCase.execute(id, target, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteBudgetUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
