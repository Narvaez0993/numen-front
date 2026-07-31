import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dismissInsightUseCase } from '@/core/di/container';

import type { AgentFeed } from '../../domain/types/AgentFeed';
import { removeInsight } from '../utils/feedCache';
import { AGENT_FEED_KEY } from './useAgentFeed';

/**
 * Optimistic on purpose: the card leaves the screen on tap. If the server
 * write fails the insight simply resurfaces on the next feed read — a
 * dismissal is not money, losing one is a shrug.
 */
export function useDismissInsight() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (key) => {
      const result = await dismissInsightUseCase.execute(key);
      if (!result.ok) {
        throw result.error;
      }
    },
    onMutate: (key) => {
      queryClient.setQueryData<AgentFeed>(AGENT_FEED_KEY, (old) =>
        removeInsight(old, key),
      );
    },
  });
}
