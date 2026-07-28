import { AxiosInstance } from 'axios';

import type { AssistantRepository } from '../../application/ports/AssistantRepository';
import type {
  AssistantBlock,
  AssistantUsage,
  ChatHistory,
  ChatMessage,
  ChatTurn,
  ConfirmedDraft,
  DraftOverrides,
  MovementDraft,
} from '../../domain/types/Assistant';
import { mapApiError } from '../mappers/mapApiError';

/** A model turn takes seconds, not the client's global 15 s worst case. */
const CHAT_TIMEOUT_MS = 60_000;

type DraftResponse = {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  description: string;
  amount: number;
  currency: string;
  source_type: 'account' | 'credit_card';
  source_id: string;
  destination_type: 'account' | 'credit_card' | null;
  destination_id: string | null;
  category_id: string | null;
  occurred_on: string;
  status: 'pending' | 'confirmed' | 'discarded';
  movement_id: string | null;
};

type BlockResponse =
  | { type: 'text'; text: string }
  | {
      type: 'stat';
      label: string;
      value: string;
      amount: number | null;
      pct: number | null;
    }
  | {
      type: 'chart';
      kind: 'bars' | 'line';
      title: string;
      points: { label: string; value: number }[];
    }
  | { type: 'navigate'; label: string; route: string }
  | { type: 'draft'; draft: DraftResponse };

type ChatMessageResponse = {
  id: string;
  role: 'user' | 'assistant';
  blocks: BlockResponse[];
  created_at: string;
};

type UsageResponse = {
  registrations: { used: number; limit: number };
  messages: { used: number; limit: number; grace: number };
};

type ChatTurnResponse = {
  message: ChatMessageResponse;
  usage: UsageResponse;
};

type HistoryResponse = {
  messages: ChatMessageResponse[];
  next_before: string | null;
};

type ConfirmResponse = {
  draft: DraftResponse;
  movement_id: string;
};

export class HttpAssistantRepository implements AssistantRepository {
  constructor(private readonly http: AxiosInstance) {}

  async sendMessage(
    text: string,
    today: string,
    clientMessageId: string,
  ): Promise<ChatTurn> {
    try {
      const { data } = await this.http.post<ChatTurnResponse>(
        '/assistant/chat',
        { text, client_message_id: clientMessageId },
        { params: { today }, timeout: CHAT_TIMEOUT_MS },
      );
      return { message: toMessage(data.message), usage: toUsage(data.usage) };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async getHistory(limit?: number, before?: string): Promise<ChatHistory> {
    try {
      const { data } = await this.http.get<HistoryResponse>('/assistant/chat/history', {
        params: { limit, before },
      });
      return {
        messages: data.messages.map(toMessage),
        nextBefore: data.next_before,
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async getUsage(today: string): Promise<AssistantUsage> {
    try {
      const { data } = await this.http.get<UsageResponse>('/assistant/usage', {
        params: { today },
      });
      return toUsage(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async confirmDraft(
    draftId: string,
    overrides: DraftOverrides,
    today: string,
  ): Promise<ConfirmedDraft> {
    try {
      const body: Record<string, unknown> = {};
      if (overrides.type !== undefined) body.type = overrides.type;
      if (overrides.description !== undefined) body.description = overrides.description;
      if (overrides.amount !== undefined) body.amount = overrides.amount;
      if (overrides.sourceType !== undefined) body.source_type = overrides.sourceType;
      if (overrides.sourceId !== undefined) body.source_id = overrides.sourceId;
      if (overrides.destinationType !== undefined)
        body.destination_type = overrides.destinationType;
      if (overrides.destinationId !== undefined)
        body.destination_id = overrides.destinationId;
      // `null` clears the category on the server; absent keeps the staged one.
      if (overrides.categoryId !== undefined) body.category_id = overrides.categoryId;
      if (overrides.occurredOn !== undefined) body.occurred_on = overrides.occurredOn;
      const { data } = await this.http.post<ConfirmResponse>(
        `/assistant/drafts/${draftId}/confirm`,
        body,
        { params: { today } },
      );
      return { draft: toDraft(data.draft), movementId: data.movement_id };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async discardDraft(draftId: string): Promise<MovementDraft> {
    try {
      const { data } = await this.http.post<{ draft: DraftResponse }>(
        `/assistant/drafts/${draftId}/discard`,
        {},
      );
      return toDraft(data.draft);
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toMessage(response: ChatMessageResponse): ChatMessage {
  return {
    id: response.id,
    role: response.role,
    blocks: response.blocks.map(toBlock),
    createdAt: response.created_at,
  };
}

function toBlock(block: BlockResponse): AssistantBlock {
  switch (block.type) {
    case 'chart':
      return {
        type: 'chart',
        kind: block.kind,
        title: block.title,
        points: block.points.map((p) => ({ label: p.label, v: p.value })),
      };
    case 'draft':
      return { type: 'draft', draft: toDraft(block.draft) };
    default:
      return block;
  }
}

function toDraft(draft: DraftResponse): MovementDraft {
  return {
    id: draft.id,
    type: draft.type,
    description: draft.description,
    amount: draft.amount,
    currency: draft.currency,
    sourceType: draft.source_type,
    sourceId: draft.source_id,
    destinationType: draft.destination_type,
    destinationId: draft.destination_id,
    categoryId: draft.category_id,
    occurredOn: draft.occurred_on,
    status: draft.status,
    movementId: draft.movement_id,
  };
}

function toUsage(usage: UsageResponse): AssistantUsage {
  return {
    registrations: { used: usage.registrations.used, limit: usage.registrations.limit },
    messages: {
      used: usage.messages.used,
      limit: usage.messages.limit,
      grace: usage.messages.grace,
    },
  };
}
