import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createCreditCardUseCase,
  deleteCreditCardUseCase,
  updateCreditCardUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { CreditCard, CreditCardPatch, NewCreditCard } from '../../domain';

type UpdateInput = { id: string; patch: CreditCardPatch };

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation<CreditCard, Error, NewCreditCard>({
    mutationFn: async (input) => {
      const result = await createCreditCardUseCase.execute(input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      invalidateMoneyViews(queryClient);
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation<CreditCard, Error, UpdateInput>({
    mutationFn: async ({ id, patch }) => {
      const result = await updateCreditCardUseCase.execute(id, patch);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      invalidateMoneyViews(queryClient);
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteCreditCardUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => {
      invalidateMoneyViews(queryClient);
    },
  });
}
