import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { AssistantSnapshot } from '../../domain/types/Assistant';

export function useAssistant() {
  return useQuery<AssistantSnapshot>({
    queryKey: ['assistant', 'snapshot'],
    queryFn: () => container.getAssistantUseCase.execute(),
  });
}
