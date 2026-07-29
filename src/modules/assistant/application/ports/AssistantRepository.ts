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
  confirmDraft(
    draftId: string,
    overrides: DraftOverrides,
    today: string,
  ): Promise<ConfirmedDraft>;
  discardDraft(draftId: string): Promise<MovementDraft>;
}
