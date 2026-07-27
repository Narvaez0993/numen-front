import axios from 'axios';

import {
  BudgetAlreadyExistsError,
  BudgetCategoryNotFoundError,
  BudgetLimitReachedError,
  BudgetNotFoundError,
  InvalidBudgetError,
} from '../../domain';

const BY_CODE: Record<string, (message?: string) => Error> = {
  'budgets.not_found': () => new BudgetNotFoundError(),
  'budgets.already_exists': () => new BudgetAlreadyExistsError(),
  'budgets.limit_reached': () => new BudgetLimitReachedError(),
  'budgets.unknown_category': () => new BudgetCategoryNotFoundError(),
  'budgets.invalid': (message) => new InvalidBudgetError(message),
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
