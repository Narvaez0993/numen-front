import type { AccountId, CategoryId } from './MovementsCatalog';

export type TransactionTag = 'recurrente' | 'transfer' | null;

export type Transaction = {
  id: string;
  date: string; // ISO YYYY-MM-DD
  /** Human-friendly bucket label: 'hoy' | 'ayer' | 'sáb 11 may' | ... */
  dayBucket: string;
  description: string;
  categoryId: CategoryId;
  accountId: AccountId;
  amount: number; // negative for expenses
  time: string;
  tag: TransactionTag;
};
