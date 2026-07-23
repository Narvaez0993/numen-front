import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { CategoriesOverview } from '../../domain';

export function useCategories() {
  return useQuery<CategoriesOverview>({
    queryKey: ['categories', 'overview'],
    queryFn: () => container.getCategoriesUseCase.execute(),
  });
}
