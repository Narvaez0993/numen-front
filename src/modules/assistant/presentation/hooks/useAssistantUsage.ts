import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AssistantUsage } from '../../domain/types/Assistant';

/** Deliberately not keyed by `today`: every chat response carries fresh usage
 * and the send mutation writes it straight into this cache. */
export const ASSISTANT_USAGE_KEY = ['assistant', 'usage'] as const;

export function useAssistantUsage(today: string) {
  return useQuery<AssistantUsage>({
    queryKey: ASSISTANT_USAGE_KEY,
    queryFn: () => container.getAssistantUsageUseCase.execute(today),
  });
}
