import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addDebtPaymentUseCase,
  createDebtUseCase,
  createSharedEventUseCase,
  deleteDebtUseCase,
  removeDebtPaymentUseCase,
  reopenDebtUseCase,
  writeOffDebtUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { DebtsSnapshot, Deuda, NewDebt, NewSharedEvent } from '../../domain';

/**
 * Every debt mutation refreshes ALL the money views, and now it has two reasons to.
 * Home's hero reads the personal-debt totals from `/home/overview`, and the cash a
 * loan or a repayment moves is a real transfer — so the account's balance, the
 * movements list and the net figure are all stale the moment one lands.
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
  return useMutation<
    Deuda,
    Error,
    { id: string; amount: number; accountId: string; note?: string }
  >({
    mutationFn: async ({ id, amount, accountId, note }) => {
      const result = await addDebtPaymentUseCase.execute(
        id,
        amount,
        accountId,
        today,
        note,
      );
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

/**
 * Giving up, and taking it back. Both touch the same money views as everything else
 * here — the write-off books a real expense, so the month, the categories and Home's
 * figures all move with it.
 */
export function useWriteOffDebt(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Deuda, Error, string>({
    mutationFn: async (id) => {
      const result = await writeOffDebtUseCase.execute(id, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}

export function useReopenDebt(today: string) {
  const queryClient = useQueryClient();
  return useMutation<Deuda, Error, string>({
    mutationFn: async (id) => {
      const result = await reopenDebtUseCase.execute(id, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => invalidateMoneyViews(queryClient),
  });
}
