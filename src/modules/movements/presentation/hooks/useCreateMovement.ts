import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createMovementUseCase } from '@/core/di/container';

import type { Movement, NewMovement } from '../../domain';

import { invalidateMoneyViews } from './useMovements';

type CreateInput = {
  movement: NewMovement;
  /** Sent as `Idempotency-Key`: a retry returns the original, not a second one. */
  idempotencyKey?: string;
};

export function useCreateMovement() {
  const queryClient = useQueryClient();
  return useMutation<Movement, Error, CreateInput>({
    mutationFn: async ({ movement, idempotencyKey }) => {
      const result = await createMovementUseCase.execute(movement, idempotencyKey);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
