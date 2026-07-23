import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { MovementsSnapshot } from '../../application/ports/MovementsRepository';

export function useMovements() {
  return useQuery<MovementsSnapshot>({
    queryKey: ['movements', 'all'],
    queryFn: () => container.getMovementsUseCase.execute(),
  });
}
