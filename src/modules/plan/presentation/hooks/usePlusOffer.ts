import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { PlusOffer } from '../../domain';

export function usePlusOffer() {
  return useQuery<PlusOffer>({
    queryKey: ['plan', 'offer'],
    queryFn: () => container.getPlusOfferUseCase.execute(),
  });
}
