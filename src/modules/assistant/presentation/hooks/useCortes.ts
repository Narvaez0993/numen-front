import { useQuery, useQueryClient } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AgentFeed, AgentOutput } from '../../domain/types/AgentFeed';
import { AGENT_FEED_KEY } from './useAgentFeed';

export const SUMMARIES_KEY = ['assistant', 'summaries'] as const;

export const corteKey = (outputId: string) => ['assistant', 'corte', outputId] as const;

/** «Resúmenes» — the whole history, Cortes and weekly reviews, newest first. */
export function useSummaries() {
  return useQuery<AgentOutput[]>({
    queryKey: SUMMARIES_KEY,
    queryFn: () => container.listSummariesUseCase.execute(),
  });
}

/**
 * One output. Seeded from whatever cache already holds it (the feed or the
 * history), so opening something a card just showed never flashes a spinner.
 */
export function useCorte(outputId: string) {
  const queryClient = useQueryClient();
  return useQuery<AgentOutput>({
    queryKey: corteKey(outputId),
    queryFn: () => container.getCorteUseCase.execute(outputId),
    initialData: () => {
      const history = queryClient.getQueryData<AgentOutput[]>(SUMMARIES_KEY);
      const fromHistory = history?.find((o) => o.id === outputId);
      if (fromHistory) return fromHistory;
      const feed = queryClient.getQueryData<AgentFeed>(AGENT_FEED_KEY);
      return feed?.outputs.find((o) => o.id === outputId);
    },
  });
}
