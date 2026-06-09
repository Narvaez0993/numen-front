import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { DebtsSnapshot } from '../../domain/types/Deuda';
import { useDeudasStore } from '../stores/useDeudasStore';

export function useDeudas() {
  const initialized = useDeudasStore((s) => s.initialized);
  const init = useDeudasStore((s) => s.init);

  const query = useQuery<DebtsSnapshot>({
    queryKey: ['deudas', 'snapshot'],
    queryFn: () => container.getDeudasUseCase.execute(),
    enabled: !initialized,
  });

  useEffect(() => {
    if (query.data && !initialized) init(query.data);
  }, [query.data, initialized, init]);

  return { isLoading: query.isLoading && !initialized };
}
