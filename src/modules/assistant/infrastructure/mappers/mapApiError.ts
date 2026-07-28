import axios from 'axios';

import {
  AgentUnavailableError,
  ChatLimitReachedError,
  DraftNotFoundError,
  DraftNotPendingError,
  DuplicateMessageError,
  RegistrationLimitReachedError,
} from '../../domain';

const BY_CODE: Record<string, () => Error> = {
  'assistant.chat_limit_reached': () => new ChatLimitReachedError(),
  'assistant.registration_limit_reached': () => new RegistrationLimitReachedError(),
  'assistant.draft_not_found': () => new DraftNotFoundError(),
  'assistant.draft_not_pending': () => new DraftNotPendingError(),
  'assistant.duplicate_message': () => new DuplicateMessageError(),
  'assistant.upstream_unavailable': () => new AgentUnavailableError(),
};

/** Translate a backend `{ code, message }` error into a domain error. */
export function mapApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    const factory = data?.code ? BY_CODE[data.code] : undefined;
    if (factory) {
      return factory();
    }
    return new Error(data?.message ?? error.message);
  }
  return error instanceof Error ? error : new Error('Network error');
}
