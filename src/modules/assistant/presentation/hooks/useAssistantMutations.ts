import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  confirmDraftUseCase,
  discardDraftUseCase,
  parseCaptureUseCase,
  sendChatMessageUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import { ChatLimitReachedError } from '../../domain';
import type {
  CaptureSource,
  ChatHistory,
  ChatTurn,
  ConfirmedDraft,
  DraftOverrides,
  MovementDraft,
  ParseOutcome,
} from '../../domain/types/Assistant';
import {
  appendMessages,
  localUserMessage,
  removeMessage,
  replaceDraft,
} from '../utils/chatCache';
import { ASSISTANT_USAGE_KEY } from './useAssistantUsage';
import { CHAT_HISTORY_KEY } from './useChatHistory';

function newClientMessageId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * The user's bubble appears optimistically and STAYS on failure — the server
 * also kept their words (it persists the message before calling the model).
 * The one exception is the limit gate: that rejection happens before anything
 * is stored, so the bubble comes back out.
 */
export function useSendMessage(today: string) {
  const queryClient = useQueryClient();
  return useMutation<ChatTurn, Error, string, { optimisticId: string }>({
    mutationFn: async (text) => {
      const result = await sendChatMessageUseCase.execute(
        text,
        today,
        newClientMessageId(),
      );
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onMutate: (text) => {
      const optimisticId = `local-${Date.now()}`;
      queryClient.setQueryData<ChatHistory>(CHAT_HISTORY_KEY, (old) =>
        appendMessages(old, [localUserMessage(text, optimisticId)]),
      );
      return { optimisticId };
    },
    onSuccess: (turn) => {
      queryClient.setQueryData<ChatHistory>(CHAT_HISTORY_KEY, (old) =>
        appendMessages(old, [turn.message]),
      );
      queryClient.setQueryData(ASSISTANT_USAGE_KEY, turn.usage);
    },
    onError: (error, _text, context) => {
      if (error instanceof ChatLimitReachedError && context) {
        queryClient.setQueryData<ChatHistory>(CHAT_HISTORY_KEY, (old) =>
          removeMessage(old, context.optimisticId),
        );
      }
    },
  });
}

/**
 * One capture from the sheet (voice or typed). Deliberately silent for the
 * chat: no message is written and the thread cache is never touched — only
 * the usage meter learns about the spent registration.
 */
export function useParseCapture(today: string) {
  const queryClient = useQueryClient();
  return useMutation<ParseOutcome, Error, { text: string; source: CaptureSource }>({
    mutationFn: async ({ text, source }) => {
      const result = await parseCaptureUseCase.execute(text, source, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (outcome) => {
      queryClient.setQueryData(ASSISTANT_USAGE_KEY, outcome.usage);
    },
  });
}

/** Confirming moves real money — every money view repaints. */
export function useConfirmDraft(today: string) {
  const queryClient = useQueryClient();
  return useMutation<
    ConfirmedDraft,
    Error,
    { draftId: string; overrides?: DraftOverrides }
  >({
    mutationFn: async ({ draftId, overrides }) => {
      const result = await confirmDraftUseCase.execute(draftId, overrides ?? {}, today);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: ({ draft }) => {
      queryClient.setQueryData<ChatHistory>(CHAT_HISTORY_KEY, (old) =>
        replaceDraft(old, draft),
      );
      invalidateMoneyViews(queryClient);
    },
  });
}

export function useDiscardDraft() {
  const queryClient = useQueryClient();
  return useMutation<MovementDraft, Error, string>({
    mutationFn: async (draftId) => {
      const result = await discardDraftUseCase.execute(draftId);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (draft) => {
      queryClient.setQueryData<ChatHistory>(CHAT_HISTORY_KEY, (old) =>
        replaceDraft(old, draft),
      );
    },
  });
}
