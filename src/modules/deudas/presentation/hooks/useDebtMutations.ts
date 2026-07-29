import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addDebtPaymentUseCase,
  createDebtUseCase,
  createSharedEventUseCase,
  deleteDebtUseCase,
  removeDebtPaymentUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { DebtsSnapshot, Deuda, NewDebt, NewSharedEvent } from '../../domain';

/**
 * Debts move no balances, but they DO move Home: the hero's debt face reads the
 * personal-debt totals from `/home/overview`, so every mutation refreshes all the
 * money views — same fan-out, same reason as everything else that shows on Home.
 */
export function useCreateDebt(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Deuda, Error, NewDebt>({
    mutationFn: async (input) => {
      const result = await createDebtUseCase.execute(input, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useCreateSharedEvent(today: string) {
  const queryClient = useQueryClient();
  return useMutation<DebtsSnapshot, Error, NewSharedEvent>({
    mutationFn: async (input) => {
      const result = await createSharedEventUseCase.execute(input, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteDebtUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useAddDebtPayment(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Deuda, Error, { id: string; amount: number; note?: string }>({
    mutationFn: async ({ id, amount, note }) => {
      const result = await addDebtPaymentUseCase.execute(id, amount, today, note);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useRemoveDebtPayment(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Deuda, Error, { id: string; paymentId: string }>({
    mutationFn: async ({ id, paymentId }) => {
      const result = await removeDebtPaymentUseCase.execute(id, paymentId, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
