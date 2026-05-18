import type {
  CreateExpensesInputDTO,
  CreateExpensesOutputDTO,
} from '../dto/CreateExpenseDTO';
import type { ExpenseRepository } from '../ports/ExpenseRepository';

export class CreateExpensesUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: CreateExpensesInputDTO): Promise<CreateExpensesOutputDTO> {
    await this.expenseRepository.createMany(input.expenses);
    return {
      savedCount: input.expenses.length,
      totalAmount: input.expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }
}
