import type { AccentColor } from '@/shared/domain';

/**
 * Someone chosen in the create flow: an existing counterparty, or a name typed fresh
 * that the server will create inline when the debt lands. Nothing is persisted while
 * picking — the prototype minted local ids here and wrote them into a store, and
 * those people never really existed.
 */
export type PersonPick = {
  id: string | null;
  name: string;
  color: AccentColor;
};

/** Stable key for lists and split maps, for picks that have no id yet. */
export function pickKey(pick: PersonPick): string {
  return pick.id ?? `new:${pick.name.trim().toLowerCase()}`;
}
