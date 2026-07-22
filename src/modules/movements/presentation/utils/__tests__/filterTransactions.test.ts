import { emptyFilters } from '../../../application/dto/MovementsFilters';
import { ACCOUNTS } from '../../../infrastructure/data/accounts';
import { CATEGORIES } from '../../../infrastructure/data/categories';
import { TRANSACTIONS } from '../../../infrastructure/data/transactions';
import { filterTransactions } from '../filterTransactions';

const catalogs = { categories: CATEGORIES, accounts: ACCOUNTS };

const MAY = TRANSACTIONS.filter((t) => t.date.startsWith('2026-05'));

describe('filterTransactions', () => {
  it('defaults to the current month (mayo) when filters are empty', () => {
    const r = filterTransactions(TRANSACTIONS, emptyFilters, catalogs);
    expect(r).toHaveLength(MAY.length);
    expect(r.every((t) => t.date.startsWith('2026-05'))).toBe(true);
  });

  it('month=abril returns only April transactions', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, month: 'abril' },
      catalogs,
    );
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((t) => t.date.startsWith('2026-04'))).toBe(true);
  });

  it('month=year returns everything in 2026', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, month: 'year' },
      catalogs,
    );
    expect(r).toHaveLength(TRANSACTIONS.length);
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

  it('type=gasto excludes transfers and income', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, type: 'gasto' },
      catalogs,
    );
    expect(r.every((t) => t.tag !== 'transfer' && t.amount < 0)).toBe(true);
  });

  it('type=ingreso keeps only positive non-transfer movements', () => {
    const r = filterTransactions(
      TRANSACTIONS,
      { ...emptyFilters, type: 'ingreso' },
      catalogs,
    );
    expect(r.map((t) => t.id)).toEqual(['t18']);
    expect(r.every((t) => t.amount > 0)).toBe(true);
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
