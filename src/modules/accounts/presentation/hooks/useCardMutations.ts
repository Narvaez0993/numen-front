import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createCreditCardUseCase,
  deleteCreditCardUseCase,
  updateCreditCardUseCase,
} from '@/core/di/container';

import type { CreditCard, CreditCardPatch, NewCreditCard } from '../../domain';

import { ACCOUNTS_OVERVIEW_KEY } from './useAccounts';

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
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_OVERVIEW_KEY });
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
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_OVERVIEW_KEY });
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
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_OVERVIEW_KEY });
    },
  });
}
