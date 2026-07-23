import type { AccentColor } from '@/shared/domain';

export type Goal = {
  id: string;
  name: string;
  iconName: string;
  color: AccentColor;
  target: number;
  saved: number;
  /** Month name the agent projects the goal will be reached ("octubre"). */
  projectionMonth: string;
};

export function goalPct(goal: Goal): number {
  return goal.target > 0 ? goal.saved / goal.target : 0;
}
