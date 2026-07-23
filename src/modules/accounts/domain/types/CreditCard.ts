import type { AccentColor } from '@/shared/domain';

export type CreditCard = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
  cutoffDay: number;
  dueLabel: string;
  debt: number;
  limit: number;
};
