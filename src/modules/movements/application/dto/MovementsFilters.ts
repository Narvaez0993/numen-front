export type MovementsTypeFilter = 'gasto' | 'recurrente' | 'transfer';

export type MovementsFilters = {
  query: string;
  month: string | null;
  accountId: string | null;
  categoryId: string | null;
  type: MovementsTypeFilter | null;
};

export const emptyFilters: MovementsFilters = {
  query: '',
  month: null,
  accountId: null,
  categoryId: null,
  type: null,
};

export const hasActiveFilters = (f: MovementsFilters): boolean =>
  f.query.length > 0 ||
  f.month !== null ||
  f.accountId !== null ||
  f.categoryId !== null ||
  f.type !== null;
