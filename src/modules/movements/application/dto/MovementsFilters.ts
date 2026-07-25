import type { MovementType } from '../../domain';

/**
 * `month` is the first day of the month being viewed and drives the API query;
 * the rest narrow the loaded list on the client.
 *
 * There is no "recurring" filter yet: nothing can be recurring until
 * subscriptions exist, and a filter that never matches is a dead affordance.
 */
export type MovementsFilters = {
  query: string;
  month: string | null;
  sourceId: string | null;
  categoryId: string | null;
  type: MovementType | null;
};

export const emptyFilters: MovementsFilters = {
  query: '',
  month: null,
  sourceId: null,
  categoryId: null,
  type: null,
};

/** Whether the user narrowed anything beyond the month they are looking at. */
export const hasActiveFilters = (f: MovementsFilters): boolean =>
  f.query.length > 0 || f.sourceId !== null || f.categoryId !== null || f.type !== null;
