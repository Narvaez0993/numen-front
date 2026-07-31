import type { AgentFeed, AgentOutput } from '../../domain/types/AgentFeed';
import type {
  AssistantUsage,
  CaptureSource,
  ChatHistory,
  ChatTurn,
  ConfirmedDraft,
  DraftOverrides,
  MovementDraft,
  ParseOutcome,
} from '../../domain/types/Assistant';

export interface AssistantRepository {
  /** `clientMessageId` makes a retried send idempotent: the server answers 409
   * instead of double-charging a turn that already ran. */
  sendMessage(text: string, today: string, clientMessageId: string): Promise<ChatTurn>;
  getHistory(limit?: number, before?: string): Promise<ChatHistory>;
  /** One capture: text in → a staged draft out, or one short question. */
  parseCapture(text: string, source: CaptureSource, today: string): Promise<ParseOutcome>;
  getUsage(today: string): Promise<AssistantUsage>;
  getFeed(today: string): Promise<AgentFeed>;
  dismissInsight(key: string): Promise<void>;
  /** The shelf («Tus Cortes»): newest first, dismissed included — history stays. */
  listOutputs(
    kind: 'monthly_summary' | 'weekly_review',
    limit?: number,
  ): Promise<AgentOutput[]>;
  getOutput(outputId: string): Promise<AgentOutput>;
  /** Idempotent: the server writes `read_at` once and echoes the output. */
  markOutputRead(outputId: string): Promise<AgentOutput>;
  dismissOutput(outputId: string): Promise<AgentOutput>;
  confirmDraft(
    draftId: string,
    overrides: DraftOverrides,
    today: string,
  ): Promise<ConfirmedDraft>;
  discardDraft(draftId: string): Promise<MovementDraft>;
}
