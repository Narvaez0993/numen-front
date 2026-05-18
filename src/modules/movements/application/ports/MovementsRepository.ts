import type { Account, Category } from '../../domain/types/MovementsCatalog';
import type { Transaction } from '../../domain/types/Transaction';

export type MovementsSnapshot = {
  transactions: Transaction[];
  categories: Record<string, Category>;
  accounts: Record<string, Account>;
};

export interface MovementsRepository {
  getAll(): Promise<MovementsSnapshot>;
}
