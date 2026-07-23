import type { AccentColor } from '@/shared/domain';

export type GoalId = 'gastos' | 'ahorrar' | 'deudas';

export type Goal = {
  id: GoalId;
  icon: string;
  color: AccentColor;
};
