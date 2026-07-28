import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createGoalUseCase,
  deleteGoalUseCase,
  moveGoalFundsUseCase,
  updateGoalUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { Goal, GoalPatch, NewGoal } from '../../domain';
import type { MoveDirection } from '../../application';

/**
 * Every one of these refreshes ALL the money views: a contribution is a real transfer
 * — the account balance drops, the net drops, Home and Cuentas must repaint.
 */
export function useCreateGoal(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Goal, Error, NewGoal>({
    mutationFn: async (input) => {
      const result = await createGoalUseCase.execute(input, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useUpdateGoal(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Goal, Error, { id: string; patch: GoalPatch }>({
    mutationFn: async ({ id, patch }) => {
      const result = await updateGoalUseCase.execute(id, patch, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteGoalUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useMoveGoalFunds(today: string) {
  const queryClient = useQueryClient();
  return useMutation<
    Goal,
    Error,
    { id: string; direction: MoveDirection; accountId: string; amount: number }
  >({
    mutationFn: async ({ id, direction, accountId, amount }) => {
      const result = await moveGoalFundsUseCase.execute(
        id,
        direction,
        accountId,
        amount,
        today,
      );
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
