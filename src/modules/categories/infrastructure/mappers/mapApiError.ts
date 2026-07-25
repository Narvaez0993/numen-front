import axios from 'axios';

import {
  CategoryLimitReachedError,
  CategoryNameTakenError,
  CategoryNotFoundError,
  InvalidCategoryError,
} from '../../domain';

const BY_CODE: Record<string, () => Error> = {
  'categories.limit_reached': () => new CategoryLimitReachedError(),
  'categories.name_taken': () => new CategoryNameTakenError(),
  'categories.not_found': () => new CategoryNotFoundError(),
  'categories.invalid': () => new InvalidCategoryError(),
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
