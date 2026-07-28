import { DomainError } from '@/shared/domain';

/** Past the grace window: the screen turns this into the gate, not a toast. */
export class ChatLimitReachedError extends DomainError {
  readonly code = 'assistant.chat_limit_reached';
  constructor() {
    super('Monthly chat message limit reached for your plan');
  }
}

export class DraftNotFoundError extends DomainError {
  readonly code = 'assistant.draft_not_found';
  constructor() {
    super('Draft not found');
  }
}

export class DraftNotPendingError extends DomainError {
  readonly code = 'assistant.draft_not_pending';
  constructor() {
    super('This draft was already confirmed or discarded');
  }
}

export class DuplicateMessageError extends DomainError {
  readonly code = 'assistant.duplicate_message';
  constructor() {
    super('This message was already received');
  }
}

/** The model provider failed; nothing was charged and the text survives. */
export class AgentUnavailableError extends DomainError {
  readonly code = 'assistant.upstream_unavailable';
  constructor() {
    super('The assistant is unavailable right now, try again');
  }
}
