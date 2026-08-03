import { useQuery, useQueryClient } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AgentFeed, AgentOutput } from '../../domain/types/AgentFeed';
import { AGENT_FEED_KEY } from './useAgentFeed';

export const CORTES_KEY = ['assistant', 'cortes'] as const;

export const corteKey = (outputId: string) => ['assistant', 'corte', outputId] as const;

/** «Tus Cortes» — the shelf, newest first. */
export function useCortes() {
  return useQuery<AgentOutput[]>({
    queryKey: CORTES_KEY,
    queryFn: () => container.listCortesUseCase.execute(),
  });
}

/**
 * One Corte. Seeded from whatever cache already holds it (feed or shelf), so
 * opening a story the entry card just showed never flashes a spinner.
 */
export function useCorte(outputId: string) {
  const queryClient = useQueryClient();
  return useQuery<AgentOutput>({
    queryKey: corteKey(outputId),
    queryFn: () => container.getCorteUseCase.execute(outputId),
    initialData: () => {
      const shelf = queryClient.getQueryData<AgentOutput[]>(CORTES_KEY);
      const fromShelf = shelf?.find((o) => o.id === outputId);
      if (fromShelf) return fromShelf;
      const feed = queryClient.getQueryData<AgentFeed>(AGENT_FEED_KEY);
      return feed?.outputs.find((o) => o.id === outputId);
    },
  });
}
