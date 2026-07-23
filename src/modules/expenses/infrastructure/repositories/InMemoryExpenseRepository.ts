import type { CreateExpenseInputDTO } from '../../application/dto/CreateExpenseDTO';
import type { ExpenseRepository } from '../../application/ports/ExpenseRepository';

/**
 * In-memory placeholder until the back exposes POST /expenses. Stores recent
 * inserts so the UI can read them back if needed during dev.
 */
export class InMemoryExpenseRepository implements ExpenseRepository {
  private readonly store: CreateExpenseInputDTO[] = [];

  async createMany(expenses: CreateExpenseInputDTO[]): Promise<void> {
    this.store.push(...expenses);
  }
}
