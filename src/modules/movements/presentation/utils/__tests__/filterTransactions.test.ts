import { emptyFilters } from '../../../application/dto/MovementsFilters';
import { ACCOUNTS } from '../../../infrastructure/data/accounts';
import { CATEGORIES } from '../../../infrastructure/data/categories';
import { TRANSACTIONS } from '../../../infrastructure/data/transactions';
import { filterTransactions } from '../filterTransactions';

const catalogs = { categories: CATEGORIES, accounts: ACCOUNTS };

describe('filterTransactions', () => {
  it('returns all when filters are empty', () => {
    expect(filterTransactions(TRANSACTIONS, emptyFilters, catalogs)).toHaveLength(
      TRANSACTIONS.length,
    );
  });

  it('filters by description query (case insensitive)', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, query: 'taxi' },
      catalogs,
    );
    expect(r).toHaveLength(1);
    expect(r[0]?.description).toBe('Taxi al trabajo');
  });

  it('filters by category name through query', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, query: 'café' },
      catalogs,
    );
    expect(r.map((t) => t.id).sort()).toEqual(['t1', 't17']);
  });

  it('filters by categoryId chip', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, categoryId: 'cafe' },
      catalogs,
    );
    expect(r).toHaveLength(2);
  });

  it('type=gasto excludes transfers', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, type: 'gasto' },
      catalogs,
    );
    expect(r.every((t) => t.tag !== 'transfer')).toBe(true);
  });

  it('type=recurrente keeps only recurrente-tagged', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, type: 'recurrente' },
      catalogs,
    );
    expect(r.map((t) => t.id).sort()).toEqual(['t13', 't6']);
  });
});
