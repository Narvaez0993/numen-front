import axios from 'axios';

import {
  CounterpartyNotFoundError,
  DebtNotFoundError,
  InvalidDebtError,
  OverpaidError,
} from '../../domain';

const BY_CODE: Record<string, (message?: string) => Error> = {
  'debts.not_found': () => new DebtNotFoundError(),
  'debts.overpaid': () => new OverpaidError(),
  'debts.counterparty_not_found': () => new CounterpartyNotFoundError(),
  'debts.invalid': (message) => new InvalidDebtError(message),
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
