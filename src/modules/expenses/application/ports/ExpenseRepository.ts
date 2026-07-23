import type { CreateExpenseInputDTO } from '../dto/CreateExpenseDTO';

export interface ExpenseRepository {
  createMany(expenses: CreateExpenseInputDTO[]): Promise<void>;
}
