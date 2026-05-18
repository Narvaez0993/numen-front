import type { MovementsFilters } from '../../application/dto/MovementsFilters';
import type { Account, Category } from '../../domain/types/MovementsCatalog';
import type { Transaction } from '../../domain/types/Transaction';

type Catalogs = {
  categories: Record<string, Category>;
  accounts: Record<string, Account>;
};

export function filterTransactions(
  transactions: Transaction[],
  filters: MovementsFilters,
  { categories, accounts }: Catalogs,
): Transaction[] {
  const query = filters.query.trim().toLowerCase();

  return transactions.filter((t) => {
    if (filters.accountId && t.accountId !== filters.accountId) return false;
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;

    switch (filters.type) {
      case 'gasto':
        if (t.tag === 'transfer') return false;
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
