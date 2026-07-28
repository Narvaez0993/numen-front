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
  sourceType: 'account' | 'credit_card';
  sourceId: string;
  destinationType: 'account' | 'credit_card' | null;
  destinationId: string | null;
  categoryId: string | null;
  occurredOn: string;
  status: MovementDraftStatus;
  movementId: string | null;
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
  | { type: 'draft'; draft: MovementDraft };

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

/** Where the words of a capture came from — stamped on the draft's provenance. */
export type CaptureSource = 'voice' | 'text';

/** Exactly one of `draft` / `clarification` is set: the agent either understood
 * a movement or has one short question. */
export type ParseOutcome = {
  draft: MovementDraft | null;
  clarification: string | null;
  usage: AssistantUsage;
};
