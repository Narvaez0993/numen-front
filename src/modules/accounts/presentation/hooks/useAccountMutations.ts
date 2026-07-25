import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createAccountUseCase,
  deleteAccountUseCase,
  updateAccountUseCase,
} from '@/core/di/container';

import type { Account, AccountPatch, NewAccount } from '../../domain';

import { ACCOUNTS_OVERVIEW_KEY } from './useAccounts';

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
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_OVERVIEW_KEY });
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
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_OVERVIEW_KEY });
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
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_OVERVIEW_KEY });
    },
  });
}
