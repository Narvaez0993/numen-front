import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { ChatHistory } from '../../domain/types/Assistant';

export const CHAT_HISTORY_KEY = ['assistant', 'history'] as const;

/** The latest page of the single thread; sends and confirms patch this cache
 * in place instead of refetching the whole conversation. */
export function useChatHistory() {
  return useQuery<ChatHistory>({
    queryKey: CHAT_HISTORY_KEY,
    queryFn: () => container.getChatHistoryUseCase.execute(),
  });
}
