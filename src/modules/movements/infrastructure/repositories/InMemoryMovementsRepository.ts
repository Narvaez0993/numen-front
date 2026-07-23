import type {
  MovementsRepository,
  MovementsSnapshot,
} from '../../application/ports/MovementsRepository';
import { ACCOUNTS } from '../data/accounts';
import { CATEGORIES } from '../data/categories';
import { TRANSACTIONS } from '../data/transactions';

export class InMemoryMovementsRepository implements MovementsRepository {
  async getAll(): Promise<MovementsSnapshot> {
    return {
      transactions: TRANSACTIONS,
      categories: CATEGORIES,
      accounts: ACCOUNTS,
    };
  }
}
