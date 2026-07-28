import type {
  AssistantUsage,
  ChatHistory,
  ChatTurn,
  ConfirmedDraft,
  DraftOverrides,
  MovementDraft,
} from '../../domain/types/Assistant';

export interface AssistantRepository {
  /** `clientMessageId` makes a retried send idempotent: the server answers 409
   * instead of double-charging a turn that already ran. */
  sendMessage(text: string, today: string, clientMessageId: string): Promise<ChatTurn>;
  getHistory(limit?: number, before?: string): Promise<ChatHistory>;
  getUsage(today: string): Promise<AssistantUsage>;
  confirmDraft(
    draftId: string,
    overrides: DraftOverrides,
    today: string,
  ): Promise<ConfirmedDraft>;
  discardDraft(draftId: string): Promise<MovementDraft>;
}
