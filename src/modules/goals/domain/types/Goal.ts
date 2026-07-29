import type { AccentColor } from '@/shared/domain';

/**
 * A pocket: money set aside for something, like a bank's *bolsillos*.
 *
 * The pocket holds **real money** — a contribution is a genuine transfer out of an
 * account, so balances and the net drop by it. Every figure below `targetDate` comes
 * derived from the server: `saved` is the sum of those transfers (never stored, so it
 * cannot drift) and the projections are computed for the snapshot's `today` — the
 * prototype persisted both and they went stale.
 */
export type Goal = {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
  target: number;
  targetDate: string | null;
  archived: boolean;
  saved: number;
  pct: number;
  achieved: boolean;
  /** `YYYY-MM` the goal lands at the current pace; the client names the month. */
  projectedOn: string | null;
  /** What each remaining month needs to land on `targetDate`; null without one. */
  neededPerMonth: number | null;
  monthlyPace: number | null;
};

export type GoalsSnapshot = {
  currency: string;
  today: string;
  /** Active pockets first (newest on top), archived history after. */
  goals: Goal[];
};

export type NewGoal = {
  name: string;
  target: number;
  targetDate?: string | null;
};

export type GoalPatch = {
  name?: string;
  target?: number;
  /** `null` clears the date; absent leaves it untouched. */
  targetDate?: string | null;
  archived?: boolean;
};
