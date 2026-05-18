import type { AccentColor } from '@/shared/domain';

export type MonthBudget = {
  spent: number;
  target: number;
  daysLeft: number;
  dailySuggested: number;
};

export type BudgetProjection = {
  willEnd: number;
  over: number;
};

export type MerchantStat = {
  description: string;
  amount: number;
  count: number;
};

export type CategoryBudget = {
  id: string;
  name: string;
  iconName: string;
  color: AccentColor;
  spent: number;
  target: number;
  topMerchants: MerchantStat[];
};

export type BudgetsSnapshot = {
  month: MonthBudget;
  projection: BudgetProjection;
  categories: CategoryBudget[];
};
