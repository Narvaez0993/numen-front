import type { AccentColor } from '@/shared/domain';

export type Expense = {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryColor: AccentColor;
  amount: number; // positive, will be stored as negative when persisted
  sourceId: string;
  sourceName: string;
  occurredAt: string; // ISO date
};

/**
 * A candidate expense that came from AI extraction (voice / photo / chat)
 * and is shown in the confirm step before the user saves.
 */
export type DetectedExpense = {
  id: string;
  description: string;
  categoryName: string;
  categoryColor: AccentColor;
  amount: number;
  sourceName: string;
};
