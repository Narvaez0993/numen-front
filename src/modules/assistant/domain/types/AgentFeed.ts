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

export type AgentFeed = {
  insights: FeedInsight[];
};
