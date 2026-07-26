import type { AccentColor } from '@/shared/domain';

export type CategoryColor = AccentColor | 'neutral';
export type CategoryFlow = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: CategoryColor;
  flow: CategoryFlow;
  isStandard: boolean;
};

export type NewCategory = {
  name: string;
  icon: string;
  color: CategoryColor;
  flow: CategoryFlow;
};

export type CategoryPatch = {
  name?: string;
  icon?: string;
  color?: CategoryColor;
};
