import { AxiosInstance } from 'axios';

import type {
  AgentFeed,
  AgentOutput,
  AgentPlay,
  FeedInsight,
  Slide,
  WeeklyReview,
} from '../../domain/types/AgentFeed';
import type { AssistantRepository } from '../../application/ports/AssistantRepository';
import type {
  AssistantBlock,
  AssistantUsage,
  CaptureSource,
  ChatHistory,
  ChatMessage,
  ChatTurn,
  ConfirmedDraft,
  DraftOverrides,
  MovementDraft,
  ParseOutcome,
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

type InsightResponse =
  | {
      kind: 'cap_alert';
      key: string;
      scope: 'global' | 'category';
      category_id: string | null;
      category_name: string | null;
      used: number;
      target: number;
      spent: number;
      over: number | null;
    }
  | {
      kind: 'upcoming_charge';
      key: string;
      subscription_id: string;
      name: string;
      amount: number;
      due_on: string;
      charge_id: string | null;
    }
  | { kind: 'uncategorized'; key: string; count: number; spent: number };

type SlideResponse =
  | { type: 'cover'; id: string; text: string }
  | { type: 'big_number'; id: string; amount: number; count: number; text: string }
  | {
      type: 'category_bars';
      id: string;
      bars: { category_id: string; name: string; amount: number; pct: number }[];
      text: string;
    }
  | {
      type: 'fun_fact';
      id: string;
      day: string;
      amount: number;
      count: number;
      text: string;
    }
  | {
      type: 'pulse';
      id: string;
      current: number;
      previous: number;
      delta_pct: number;
      text: string;
    }
  | {
      type: 'goal';
      id: string;
      goal_id: string;
      name: string;
      saved: number;
      target: number;
      pct: number;
      needed_per_month: number | null;
      text: string;
    }
  | { type: 'first_month'; id: string; text: string }
  | { type: 'play'; id: string; play_id: string; text: string };

type PlayLifecycleResponse = {
  id: string;
  text: string;
  status: 'proposed' | 'applying' | 'applied' | 'failed';
  result_id: string | null;
  failure_code: string | null;
};

type PlayResponse = PlayLifecycleResponse &
  (
    | {
        action: 'set_category_cap';
        category_id: string;
        category_name: string;
        target: number;
        linked_goal_id: string | null;
      }
    | {
        action: 'raise_category_cap';
        budget_id: string;
        category_id: string;
        category_name: string;
        current_target: number;
        target: number;
      }
    | { action: 'set_month_cap'; target: number }
    | { action: 'contribute_goal'; goal_id: string; goal_name: string; amount: number }
    | { action: 'treat'; amount: number }
  );

type WeeklyPayloadResponse = {
  diagnosis_text: string;
  week_total: number;
  prev_week_total: number | null;
  delta_pct: number | null;
  top_category_id: string | null;
  top_category_name: string | null;
  accountability: {
    play_id: string;
    action: AgentPlay['action'];
    text: string;
    status: 'proposed' | 'applying' | 'applied' | 'failed';
  }[];
  // Report blocks (ago 2026) — optional: stored reviews predate them.
  date_from?: string | null;
  date_to?: string | null;
  movements?: number | null;
  by_day?: { day: string; spent: number }[];
  top_categories?: { category_id: string | null; name: string | null; spent: number }[];
  biggest_merchant?: { label: string; spent: number } | null;
  cap?: { target: number; spent: number; used: number } | null;
  goal?: { name: string; saved: number; target: number; pct: number } | null;
};

type AgentOutputResponse = {
  id: string;
  kind: 'monthly_summary' | 'weekly_review';
  period: string;
  /** One field, two shapes — the kind says which one is filled. */
  payload: Partial<WeeklyPayloadResponse> & { slides?: SlideResponse[] };
  plays: PlayResponse[];
  created_at: string;
  read_at: string | null;
  dismissed_at: string | null;
};

type FeedResponse = {
  insights: InsightResponse[];
  outputs: AgentOutputResponse[];
  unseen_count: number;
};

type ParseResponse = {
  draft: DraftResponse | null;
  clarification: string | null;
  usage: UsageResponse;
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

  async parseCapture(
    text: string,
    source: CaptureSource,
    today: string,
  ): Promise<ParseOutcome> {
    try {
      const { data } = await this.http.post<ParseResponse>(
        '/assistant/parse',
        { text, source },
        { params: { today }, timeout: CHAT_TIMEOUT_MS },
      );
      return {
        draft: data.draft !== null ? toDraft(data.draft) : null,
        clarification: data.clarification,
        usage: toUsage(data.usage),
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async getFeed(today: string): Promise<AgentFeed> {
    try {
      const { data } = await this.http.get<FeedResponse>('/assistant/feed', {
        params: { today },
      });
      return {
        insights: data.insights.map(toInsight),
        outputs: data.outputs.map(toOutput),
        unseenCount: data.unseen_count,
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async dismissInsight(key: string): Promise<void> {
    try {
      await this.http.post('/assistant/insights/dismiss', { key });
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async listOutputs(
    kind: 'monthly_summary' | 'weekly_review',
    limit?: number,
  ): Promise<AgentOutput[]> {
    try {
      const { data } = await this.http.get<{ outputs: AgentOutputResponse[] }>(
        '/assistant/outputs',
        { params: { kind, limit } },
      );
      return data.outputs.map(toOutput);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async getOutput(outputId: string): Promise<AgentOutput> {
    try {
      const { data } = await this.http.get<AgentOutputResponse>(
        `/assistant/outputs/${outputId}`,
      );
      return toOutput(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async markOutputRead(outputId: string): Promise<AgentOutput> {
    try {
      const { data } = await this.http.post<AgentOutputResponse>(
        `/assistant/outputs/${outputId}/read`,
        {},
      );
      return toOutput(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async applyPlay(
    outputId: string,
    playId: string,
    accountId: string | null,
    today: string,
  ): Promise<AgentOutput> {
    try {
      const { data } = await this.http.post<AgentOutputResponse>(
        `/assistant/outputs/${outputId}/plays/${playId}/apply`,
        accountId !== null ? { account_id: accountId } : {},
        { params: { today } },
      );
      return toOutput(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async dismissOutput(outputId: string): Promise<AgentOutput> {
    try {
      const { data } = await this.http.post<AgentOutputResponse>(
        `/assistant/outputs/${outputId}/dismiss`,
        {},
      );
      return toOutput(data);
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

function toInsight(insight: InsightResponse): FeedInsight {
  switch (insight.kind) {
    case 'cap_alert':
      return {
        kind: 'cap_alert',
        key: insight.key,
        scope: insight.scope,
        categoryId: insight.category_id,
        categoryName: insight.category_name,
        used: insight.used,
        target: insight.target,
        spent: insight.spent,
        over: insight.over,
      };
    case 'upcoming_charge':
      return {
        kind: 'upcoming_charge',
        key: insight.key,
        subscriptionId: insight.subscription_id,
        name: insight.name,
        amount: insight.amount,
        dueOn: insight.due_on,
        chargeId: insight.charge_id,
      };
    case 'uncategorized':
      return {
        kind: 'uncategorized',
        key: insight.key,
        count: insight.count,
        spent: insight.spent,
      };
  }
}

function toSlide(slide: SlideResponse): Slide {
  switch (slide.type) {
    case 'category_bars':
      return {
        type: 'category_bars',
        id: slide.id,
        bars: slide.bars.map((b) => ({
          categoryId: b.category_id,
          name: b.name,
          amount: b.amount,
          pct: b.pct,
        })),
        text: slide.text,
      };
    case 'pulse':
      return {
        type: 'pulse',
        id: slide.id,
        current: slide.current,
        previous: slide.previous,
        deltaPct: slide.delta_pct,
        text: slide.text,
      };
    case 'goal':
      return {
        type: 'goal',
        id: slide.id,
        goalId: slide.goal_id,
        name: slide.name,
        saved: slide.saved,
        target: slide.target,
        pct: slide.pct,
        neededPerMonth: slide.needed_per_month,
        text: slide.text,
      };
    case 'play':
      return { type: 'play', id: slide.id, playId: slide.play_id, text: slide.text };
    default:
      return slide;
  }
}

function toPlay(play: PlayResponse): AgentPlay {
  const base = {
    id: play.id,
    text: play.text,
    status: play.status,
    resultId: play.result_id,
    failureCode: play.failure_code,
  };
  switch (play.action) {
    case 'set_category_cap':
      return {
        ...base,
        action: 'set_category_cap',
        categoryId: play.category_id,
        categoryName: play.category_name,
        target: play.target,
        linkedGoalId: play.linked_goal_id,
      };
    case 'raise_category_cap':
      return {
        ...base,
        action: 'raise_category_cap',
        budgetId: play.budget_id,
        categoryId: play.category_id,
        categoryName: play.category_name,
        currentTarget: play.current_target,
        target: play.target,
      };
    case 'set_month_cap':
      return { ...base, action: 'set_month_cap', target: play.target };
    case 'contribute_goal':
      return {
        ...base,
        action: 'contribute_goal',
        goalId: play.goal_id,
        goalName: play.goal_name,
        amount: play.amount,
      };
    case 'treat':
      return { ...base, action: 'treat', amount: play.amount };
  }
}

function toWeekly(payload: AgentOutputResponse['payload']): WeeklyReview | null {
  if (payload.diagnosis_text === undefined) return null;
  return {
    diagnosisText: payload.diagnosis_text,
    weekTotal: payload.week_total ?? 0,
    prevWeekTotal: payload.prev_week_total ?? null,
    deltaPct: payload.delta_pct ?? null,
    topCategoryId: payload.top_category_id ?? null,
    topCategoryName: payload.top_category_name ?? null,
    accountability: (payload.accountability ?? []).map((entry) => ({
      playId: entry.play_id,
      action: entry.action,
      text: entry.text,
      status: entry.status,
    })),
    dateFrom: payload.date_from ?? null,
    dateTo: payload.date_to ?? null,
    movements: payload.movements ?? null,
    byDay: (payload.by_day ?? []).map((d) => ({ day: d.day, spent: d.spent })),
    topCategories: (payload.top_categories ?? []).map((c) => ({
      categoryId: c.category_id,
      name: c.name,
      spent: c.spent,
    })),
    biggestMerchant: payload.biggest_merchant ?? null,
    cap: payload.cap ?? null,
    goal: payload.goal ?? null,
  };
}

function toOutput(output: AgentOutputResponse): AgentOutput {
  return {
    id: output.id,
    kind: output.kind,
    period: output.period,
    slides: (output.payload.slides ?? []).map(toSlide),
    weekly: toWeekly(output.payload),
    plays: output.plays.map(toPlay),
    createdAt: output.created_at,
    readAt: output.read_at,
    dismissedAt: output.dismissed_at,
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
