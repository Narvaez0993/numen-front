import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { HomeOverview } from '../../domain/types/HomeOverview';

export function useHomeOverview() {
  return useQuery<HomeOverview>({
    queryKey: ['home', 'overview'],
    queryFn: () => container.getHomeOverviewUseCase.execute(),
  });
}
