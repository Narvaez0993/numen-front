import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { Category } from '../../domain';

export function useCategories() {
  return useQuery<readonly Category[]>({
    queryKey: ['categories', 'overview'],
    queryFn: () => container.getCategoriesUseCase.execute(),
  });
}
