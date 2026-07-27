import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createAccountUseCase,
  deleteAccountUseCase,
  updateAccountUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { Account, AccountPatch, NewAccount } from '../../domain';

type UpdateInput = { id: string; patch: AccountPatch };

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, NewAccount>({
    mutationFn: async (input) => {
      const result = await createAccountUseCase.execute(input);
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

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, UpdateInput>({
    mutationFn: async ({ id, patch }) => {
      const result = await updateAccountUseCase.execute(id, patch);
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

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteAccountUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => {
      invalidateMoneyViews(queryClient);
    },
  });
}
