import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCategoryUseCase } from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteCategoryUseCase.execute(id);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => {
      invalidateMoneyViews(queryClient);
    },
  });
}
