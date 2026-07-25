import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCategoryUseCase } from '@/core/di/container';

import type { Category, CategoryPatch } from '../../domain';

type UpdateInput = { id: string; patch: CategoryPatch };

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, UpdateInput>({
    mutationFn: async ({ id, patch }) => {
      const result = await updateCategoryUseCase.execute(id, patch);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', 'overview'] });
    },
  });
}
