/**
 * Pure cache surgery for the single chat thread. Sends append, confirms and
 * discards replace the draft inside whatever message carries it — the UI never
 * refetches 50 messages to flip one status.
 */

import type {
  AssistantBlock,
  ChatHistory,
  ChatMessage,
  MovementDraft,
} from '../../domain/types/Assistant';

export function appendMessages(
  history: ChatHistory | undefined,
  messages: ChatMessage[],
): ChatHistory {
  const base = history ?? { messages: [], nextBefore: null };
  return { ...base, messages: [...base.messages, ...messages] };
}

export function removeMessage(history: ChatHistory | undefined, id: string): ChatHistory {
  const base = history ?? { messages: [], nextBefore: null };
  return { ...base, messages: base.messages.filter((message) => message.id !== id) };
}

export function replaceDraft(
  history: ChatHistory | undefined,
  draft: MovementDraft,
): ChatHistory {
  const base = history ?? { messages: [], nextBefore: null };
  return {
    ...base,
    messages: base.messages.map((message) => ({
      ...message,
      blocks: message.blocks.map(
        (block): AssistantBlock =>
          block.type === 'draft' && block.draft.id === draft.id
            ? { ...block, draft }
            : block,
      ),
    })),
  };
}

export function localUserMessage(text: string, id: string): ChatMessage {
  return {
    id,
    role: 'user',
    blocks: [{ type: 'text', text }],
    createdAt: new Date().toISOString(),
  };
}
