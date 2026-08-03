import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AgentFeed } from '../../domain/types/AgentFeed';

/** Constant key on purpose: mutations patch this cache surgically. */
export const AGENT_FEED_KEY = ['assistant', 'feed'] as const;

export function useAgentFeed(today: string) {
  return useQuery<AgentFeed>({
    queryKey: AGENT_FEED_KEY,
    queryFn: () => container.getAssistantFeedUseCase.execute(today),
  });
}
