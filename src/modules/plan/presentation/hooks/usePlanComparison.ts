import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { PlanComparison } from '../../domain';

export function usePlanComparison() {
  return useQuery<PlanComparison>({
    queryKey: ['plan', 'comparison'],
    queryFn: () => container.getPlanComparisonUseCase.execute(),
  });
}
