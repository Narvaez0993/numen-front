import axios from 'axios';

import {
  InvalidMovementError,
  MovementCategoryNotFoundError,
  MovementNotFoundError,
  MovementSourceNotFoundError,
} from '../../domain';

const BY_CODE: Record<string, () => Error> = {
  'movements.not_found': () => new MovementNotFoundError(),
  'movements.source_not_found': () => new MovementSourceNotFoundError(),
  'movements.category_not_found': () => new MovementCategoryNotFoundError(),
  'movements.invalid': () => new InvalidMovementError(),
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
