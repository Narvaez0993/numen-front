import type { MovementsFilters } from '../../application/dto/MovementsFilters';
import type { Account, Category } from '../../domain/types/MovementsCatalog';
import type { Transaction } from '../../domain/types/Transaction';

type Catalogs = {
  categories: Record<string, Category>;
  accounts: Record<string, Account>;
};

// Mock "today" is 2026-05-14 (matches the seeded dayBucket labels).
const CURRENT_MONTH_PREFIX = '2026-05';
const NINETY_DAYS_FLOOR = '2026-02-14';
const MONTH_PREFIXES: Record<string, string> = {
  abril: '2026-04',
  marzo: '2026-03',
};

function matchesMonth(t: Transaction, month: string | null): boolean {
  if (month === null) return t.date.startsWith(CURRENT_MONTH_PREFIX);
  if (month === '90d') return t.date >= NINETY_DAYS_FLOOR;
  if (month === 'year') return t.date.startsWith('2026-');
  const prefix = MONTH_PREFIXES[month];
  return prefix ? t.date.startsWith(prefix) : true;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: MovementsFilters,
  { categories, accounts }: Catalogs,
): Transaction[] {
  const query = filters.query.trim().toLowerCase();

  return transactions.filter((t) => {
    if (!matchesMonth(t, filters.month)) return false;
    if (filters.accountId && t.accountId !== filters.accountId) return false;
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;

    switch (filters.type) {
      case 'gasto':
        if (t.tag === 'transfer' || t.amount > 0) return false;
        break;
      case 'ingreso':
        if (t.tag === 'transfer' || t.amount <= 0) return false;
        break;
      case 'recurrente':
        if (t.tag !== 'recurrente') return false;
        break;
      case 'transfer':
        if (t.tag !== 'transfer') return false;
        break;
      default:
        break;
    }

    if (query) {
      const desc = t.description.toLowerCase();
      const cat = categories[t.categoryId]?.name.toLowerCase() ?? '';
      const acc = accounts[t.accountId]?.name.toLowerCase() ?? '';
      const amountStr = String(Math.abs(t.amount));
      const matches =
        desc.includes(query) ||
        cat.includes(query) ||
        acc.includes(query) ||
        amountStr.includes(query);
      if (!matches) return false;
    }

    return true;
  });
}
