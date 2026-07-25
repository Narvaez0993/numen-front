import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMovementUseCase, updateMovementUseCase } from '@/core/di/container';

import type { Movement, MovementPatch } from '../../domain';

import { invalidateMoneyViews } from './useMovements';

type UpdateInput = { id: string; patch: MovementPatch };

export function useUpdateMovement() {
  const queryClient = useQueryClient();
  return useMutation<Movement, Error, UpdateInput>({
    mutationFn: async ({ id, patch }) => {
      const result = await updateMovementUseCase.execute(id, patch);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteMovementUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
