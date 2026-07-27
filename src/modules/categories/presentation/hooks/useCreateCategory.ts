import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCategoryUseCase } from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { Category, NewCategory } from '../../domain';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, NewCategory>({
    mutationFn: async (input) => {
      const result = await createCategoryUseCase.execute(input);
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
