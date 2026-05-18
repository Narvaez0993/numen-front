import type { AccentColor } from '@/shared/domain';

export type DailyAllowance = {
  suggested: number;
  spent: number;
};

export type Saldo = {
  net: number;
  accounts: number;
  hasCash: boolean;
  hasTC: number;
};

export type MonthProgress = {
  spent: number;
  target: number;
  daysLeft: number;
};

export type CategoryProgress = {
  id: string;
  name: string;
  iconName: string;
  color: AccentColor;
  spent: number;
  target: number;
};

export type UpcomingSub = {
  id: string;
  name: string;
  amount: number;
  daysUntil: number;
  iconName: string;
  color: AccentColor;
};

export type RecentExpenseTag = 'recurrente' | 'transfer' | null;

export type RecentExpense = {
  id: string;
  description: string;
  category: string;
  iconName: string;
  color: AccentColor;
  amount: number;
  time: string;
  tag: RecentExpenseTag;
};

export type HomeOverview = {
  greeting: string;
  daily: DailyAllowance;
  saldo: Saldo;
  month: MonthProgress;
  topCategories: CategoryProgress[];
  upcoming: UpcomingSub[];
  recent: RecentExpense[];
};
