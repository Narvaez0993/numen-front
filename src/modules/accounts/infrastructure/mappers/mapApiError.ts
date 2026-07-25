import axios from 'axios';

import {
  AccountLimitReachedError,
  AccountNotFoundError,
  CreditCardLimitReachedError,
  InvalidAccountError,
} from '../../domain';

const BY_CODE: Record<string, () => Error> = {
  'accounts.limit_reached': () => new AccountLimitReachedError(),
  'accounts.card_limit_reached': () => new CreditCardLimitReachedError(),
  'accounts.not_found': () => new AccountNotFoundError(),
  'accounts.invalid': () => new InvalidAccountError(),
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
