import axios from 'axios';

import {
  ChargeAlreadySettledError,
  ChargeNotFoundError,
  InvalidSubscriptionError,
  SubscriptionCategoryNotFoundError,
  SubscriptionNotFoundError,
  SubscriptionSourceCurrencyMismatchError,
  SubscriptionSourceNotFoundError,
} from '../../domain';

const BY_CODE: Record<string, (message?: string) => Error> = {
  'subscriptions.not_found': () => new SubscriptionNotFoundError(),
  'subscriptions.source_not_found': () => new SubscriptionSourceNotFoundError(),
  'subscriptions.category_not_found': () => new SubscriptionCategoryNotFoundError(),
  'subscriptions.invalid': () => new InvalidSubscriptionError(),
  'subscriptions.charge_not_found': () => new ChargeNotFoundError(),
  'subscriptions.charge_already_settled': () => new ChargeAlreadySettledError(),
  'subscriptions.source_currency_mismatch': (message) =>
    new SubscriptionSourceCurrencyMismatchError(message),
};

/** Translate a backend `{ code, message }` error into a domain error. */
export function mapApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    const factory = data?.code ? BY_CODE[data.code] : undefined;
    if (factory) {
      return factory(data?.message);
    }
    return new Error(data?.message ?? error.message);
  }
  return error instanceof Error ? error : new Error('Network error');
}
