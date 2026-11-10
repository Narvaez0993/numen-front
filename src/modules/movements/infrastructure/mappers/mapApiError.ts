import axios from 'axios';

import {
  InvalidMovementError,
  MovementCategoryNotFoundError,
  MovementNotFoundError,
  MovementSourceNotFoundError,
} from '../../domain';

/**
 * The API answers every movement rule with the same `movements.invalid` code and
 * says which rule in the message («Amount must be greater than zero», «Amount is
 * out of range»). The amount is the one the form can point at, so it is read
 * from there rather than lost in a generic «could not save».
 */
const AMOUNT_MESSAGE = /^amount\b/i;

const BY_CODE: Record<string, (message: string | undefined) => Error> = {
  'movements.not_found': () => new MovementNotFoundError(),
  'movements.source_not_found': () => new MovementSourceNotFoundError(),
  'movements.category_not_found': () => new MovementCategoryNotFoundError(),
  'movements.invalid': (message) =>
    new InvalidMovementError(
      message,
      message !== undefined && AMOUNT_MESSAGE.test(message) ? 'amount' : null,
    ),
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
