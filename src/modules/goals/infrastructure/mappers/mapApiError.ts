import axios from 'axios';

import {
  GoalArchivedError,
  GoalInsufficientError,
  GoalLimitReachedError,
  GoalNotEmptyError,
  GoalNotFoundError,
  InvalidGoalError,
} from '../../domain';

const BY_CODE: Record<string, (message?: string) => Error> = {
  'goals.not_found': () => new GoalNotFoundError(),
  'goals.limit_reached': () => new GoalLimitReachedError(),
  'goals.not_empty': () => new GoalNotEmptyError(),
  'goals.insufficient': () => new GoalInsufficientError(),
  'goals.archived': () => new GoalArchivedError(),
  'goals.invalid': (message) => new InvalidGoalError(message),
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
