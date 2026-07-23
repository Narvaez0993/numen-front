export type CreateExpenseInputDTO = {
  description: string;
  categoryName: string;
  amount: number;
  sourceName: string;
};

export type CreateExpensesInputDTO = {
  expenses: CreateExpenseInputDTO[];
};

export type CreateExpensesOutputDTO = {
  savedCount: number;
  totalAmount: number;
};
