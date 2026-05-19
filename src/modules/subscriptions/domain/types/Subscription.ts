import type { AccentColor } from '@/shared/domain';

export type Subscription = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
  amount: number;
  every: number;
  account: string;
  nextInDays: number;
  urgent: boolean;
};
