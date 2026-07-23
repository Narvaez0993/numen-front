import type { AccentColor } from '@/shared/domain';

export type CategoryColor = AccentColor | 'neutral';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: CategoryColor;
  spent: number;
  count: number;
};
