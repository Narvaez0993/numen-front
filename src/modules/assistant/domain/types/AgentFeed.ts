/**
 * The agent's feed — mirror of the server's `insights.py` (and, in the next
 * stage, `outputs.py`). Rule insights arrive as data plus a deterministic
 * `key`; the copy is the client's job (i18n), so the server never speaks.
 */

export type CapAlertInsight = {
  kind: 'cap_alert';
  key: string;
  scope: 'global' | 'category';
  categoryId: string | null;
  categoryName: string | null;
  /** `spent / target`, unclamped — >1 means broken. */
  used: number;
  target: number;
  spent: number;
  over: number | null;
};

export type UpcomingChargeInsight = {
  kind: 'upcoming_charge';
  key: string;
  subscriptionId: string;
  name: string;
  amount: number;
  dueOn: string;
  chargeId: string | null;
};

export type UncategorizedInsight = {
  kind: 'uncategorized';
  key: string;
  count: number;
  spent: number;
};

export type FeedInsight = CapAlertInsight | UpcomingChargeInsight | UncategorizedInsight;

/**
 * El Corte's slides — frozen snapshots of a closed month. Numbers and
 * narration were baked at generation; nothing here is recomputed on read,
 * which is why a July Corte replayed in October still tells July's truth.
 */

export type CoverSlide = { type: 'cover'; id: string; text: string };

export type BigNumberSlide = {
  type: 'big_number';
  id: string;
  amount: number;
  count: number;
  text: string;
};

export type CategoryBar = {
  categoryId: string;
  name: string;
  amount: number;
  /** Fraction of the month's expense total, 0..1. */
  pct: number;
};

export type CategoryBarsSlide = {
  type: 'category_bars';
  id: string;
  bars: CategoryBar[];
  text: string;
};

export type FunFactSlide = {
  type: 'fun_fact';
  id: string;
  /** `YYYY-MM-DD` — the client names the weekday in the user's language. */
  day: string;
  amount: number;
  count: number;
  text: string;
};

export type PulseSlide = {
  type: 'pulse';
  id: string;
  current: number;
  previous: number;
  /** Signed fraction vs the previous month (−0.08 = 8% less). */
  deltaPct: number;
  text: string;
};

export type GoalSlide = {
  type: 'goal';
  id: string;
  goalId: string;
  name: string;
  saved: number;
  target: number;
  pct: number;
  neededPerMonth: number | null;
  text: string;
};

export type FirstMonthSlide = { type: 'first_month'; id: string; text: string };

export type PlaySlide = {
  type: 'play';
  id: string;
  /** Points into the same output's `plays` — resolved locally, never fetched. */
  playId: string;
  text: string;
};

export type Slide =
  | CoverSlide
  | BigNumberSlide
  | CategoryBarsSlide
  | FunFactSlide
  | PulseSlide
  | GoalSlide
  | FirstMonthSlide
  | PlaySlide;

/** A play's lifecycle. `treat` is advice — it never applies. */
export type PlayStatus = 'proposed' | 'applying' | 'applied' | 'failed';

type PlayBase = {
  id: string;
  text: string;
  status: PlayStatus;
  resultId: string | null;
  failureCode: string | null;
};

export type SetCategoryCapPlay = PlayBase & {
  action: 'set_category_cap';
  categoryId: string;
  categoryName: string;
  target: number;
  linkedGoalId: string | null;
};

export type RaiseCategoryCapPlay = PlayBase & {
  action: 'raise_category_cap';
  budgetId: string;
  categoryId: string;
  categoryName: string;
  currentTarget: number;
  target: number;
};

export type SetMonthCapPlay = PlayBase & { action: 'set_month_cap'; target: number };

export type ContributeGoalPlay = PlayBase & {
  action: 'contribute_goal';
  goalId: string;
  goalName: string;
  amount: number;
};

export type TreatPlay = PlayBase & { action: 'treat'; amount: number };

export type AgentPlay =
  | SetCategoryCapPlay
  | RaiseCategoryCapPlay
  | SetMonthCapPlay
  | ContributeGoalPlay
  | TreatPlay;

export type AgentOutputKind = 'monthly_summary' | 'weekly_review';

/**
 * What last week's proposals ended up doing. The coach shows this back before
 * proposing anything new — a plan nobody checks is not a plan.
 */
export type PlayFollowUp = {
  playId: string;
  action: AgentPlay['action'];
  text: string;
  status: PlayStatus;
};

export type WeeklyReview = {
  /** The coach's read of the week — narrated, never a number of its own. */
  diagnosisText: string;
  weekTotal: number;
  prevWeekTotal: number | null;
  /** Signed fraction vs the previous week; null on the first tracked week. */
  deltaPct: number | null;
  topCategoryId: string | null;
  topCategoryName: string | null;
  accountability: PlayFollowUp[];
};

export type AgentOutput = {
  id: string;
  kind: AgentOutputKind;
  /** `2026-07` for a Corte, `2026-W31` for a weekly review. */
  period: string;
  /** Populated for a Corte; empty for a weekly review. */
  slides: Slide[];
  /** Populated for a weekly review; null for a Corte. */
  weekly: WeeklyReview | null;
  plays: AgentPlay[];
  createdAt: string;
  readAt: string | null;
  dismissedAt: string | null;
};

export type AgentFeed = {
  insights: FeedInsight[];
  outputs: AgentOutput[];
  unseenCount: number;
};
