/**
 * The agent speaks in typed blocks — never free-form JSON. The union mirrors
 * the server's `blocks.py` (the single source of truth): a renamed key there
 * shows up here as a compile error in the repository mapper, not as an
 * `undefined` on screen.
 */

export type ChartPoint = {
  label: string;
  v: number;
};

export type MovementDraftStatus = 'pending' | 'confirmed' | 'discarded';

/**
 * A movement the agent understood but nobody confirmed yet. It keeps its
 * status forever: the chat history shows what became of every draft, hydrated
 * by the server on each read.
 */
export type MovementDraft = {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  description: string;
  amount: number;
  currency: string;
  /** `null` when the capture never said where the money came from and the user
   * owns more than one source. The confirm card asks; the agent does not guess. */
  sourceType: 'account' | 'credit_card' | null;
  sourceId: string | null;
  destinationType: 'account' | 'credit_card' | null;
  destinationId: string | null;
  categoryId: string | null;
  occurredOn: string;
  status: MovementDraftStatus;
  movementId: string | null;
};

/**
 * A debt the agent understood but nobody confirmed yet.
 *
 * Its own type rather than a movement draft with extra fields, because lending is
 * not spending: the cash becomes a claim and the user is no poorer for it. The card
 * it renders asks different questions — which person, which account — and `null` on
 * either is a legitimate state: the agent heard a name it did not recognise, and it
 * is not allowed to guess which account the money left.
 */
/**
 * `new` opens a debt; `payment` pays one down.
 *
 * The distinction shipped late and the gap was visible: "Santiago me pagó $2.000"
 * had no verb that fit, so the agent opened a SECOND debt for Santiago.
 */
export type DebtDraftKind = 'new' | 'payment';

export type DebtDraft = {
  id: string;
  kind: DebtDraftKind;
  /** Which debt is being paid. Set on a `payment`, never on a `new` one. */
  targetDebtId: string | null;
  /** `incoming` = they owe me · `outgoing` = I owe them. */
  direction: 'incoming' | 'outgoing';
  /** Set when the spoken name matched someone already in the ledger. */
  counterpartyId: string | null;
  /** What the user called them. Creates the person on confirm when no id matched. */
  counterpartyName: string;
  amount: number;
  currency: string;
  /** `null` until the card asks — and still `null` afterwards when the honest
   *  answer is that no money moved (a split bill already left as one expense).
   *  A **payment** has no such answer: being paid back IS money changing hands. */
  accountId: string | null;
  dueOn: string | null;
  note: string | null;
  status: MovementDraftStatus;
  debtId: string | null;
};

/** The only places a navigate chip may point at — the server enforces the
 * same allowlist; this typed twin keeps the client honest too. */
export const ASSISTANT_ROUTES = [
  '/accounts',
  '/budgets',
  '/categories',
  '/deudas',
  '/goals',
  '/movements',
  '/plan',
  '/profile',
  '/subscriptions',
] as const;

export type AssistantRoute = (typeof ASSISTANT_ROUTES)[number];

export function isAssistantRoute(route: string): route is AssistantRoute {
  return (ASSISTANT_ROUTES as readonly string[]).includes(route);
}

export type AssistantBlock =
  | { type: 'text'; text: string }
  | {
      type: 'stat';
      label: string;
      value: string;
      amount: number | null;
      pct: number | null;
    }
  | { type: 'chart'; kind: 'bars' | 'line'; title: string; points: ChartPoint[] }
  | { type: 'navigate'; label: string; route: string }
  | { type: 'draft'; draft: MovementDraft }
  | { type: 'debt_draft'; debtDraft: DebtDraft };

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  blocks: AssistantBlock[];
  createdAt: string;
};

export type ChatHistory = {
  messages: ChatMessage[];
  nextBefore: string | null;
};

export type UsageCounter = {
  used: number;
  limit: number;
};

export type MessagesCounter = UsageCounter & {
  /** Messages served past the limit before the hard gate — the nudge window. */
  grace: number;
};

export type AssistantUsage = {
  registrations: UsageCounter;
  messages: MessagesCounter;
};

export type ChatTurn = {
  message: ChatMessage;
  usage: AssistantUsage;
};

/** The user's edits from the confirm sheet; absent fields keep what the agent
 * staged. `categoryId: null` explicitly clears the category. */
export type DraftOverrides = Partial<{
  type: 'expense' | 'income' | 'transfer';
  description: string;
  amount: number;
  sourceType: 'account' | 'credit_card';
  sourceId: string;
  destinationType: 'account' | 'credit_card' | null;
  destinationId: string | null;
  categoryId: string | null;
  occurredOn: string;
}>;

export type ConfirmedDraft = {
  draft: MovementDraft;
  movementId: string;
};

/** The card's answers. `accountId: null` is a real answer — "no money moved" — and
 *  the truth for a split bill, so it is a decision rather than an omission. */
export type DebtDraftOverrides = Partial<{
  /** Which debt the abono pays down, when the capture named nobody. */
  targetDebtId: string;
  direction: 'incoming' | 'outgoing';
  counterpartyId: string;
  counterpartyName: string;
  amount: number;
  accountId: string | null;
  dueOn: string | null;
  note: string | null;
}>;

export type ConfirmedDebtDraft = {
  draft: DebtDraft;
  debtId: string;
  /** Set on an abono. Its presence is what says which undo applies: delete this
   *  movement, rather than delete the debt. */
  movementId: string | null;
};

/**
 * What one confirm created, in the shape undo needs.
 *
 * Undo is not one operation: a movement is deleted, a new debt is deleted (which
 * reverts its loan transfer with it), and an abono is undone by deleting the
 * movement that carried it — the debt has to survive that one.
 */
export type CapturedRecord =
  | { kind: 'movement'; movementId: string }
  | { kind: 'debt'; debtId: string }
  | { kind: 'payment'; debtId: string; movementId: string };

/** Where the words of a capture came from — stamped on the draft's provenance. */
export type CaptureSource = 'voice' | 'text';

/** Either the draft lists carry what was understood or `clarification` carries a
 * question — never both. Two lists because one breath can hold several things ("10
 * mil en café, 5 mil en papitas"), and because lending is not spending: "le presté
 * 50 mil a Andrés" comes back as a debt draft, not an expense. */
export type ParseOutcome = {
  drafts: MovementDraft[];
  debtDrafts: DebtDraft[];
  clarification: string | null;
  /** What the capture heard but could NOT record — the monthly quota running out
   *  mid-sentence, mostly. Understanding three things and saving one used to look
   *  exactly like understanding one. */
  notice: string | null;
  usage: AssistantUsage;
};
