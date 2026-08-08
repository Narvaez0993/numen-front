import type { ResolvedSource } from '@/modules/movements/presentation/hooks/useMovementCatalogs';

import type { MovementDraft } from '../../domain/types/Assistant';

/**
 * The sources a movement may legally name — not the same list for every type.
 * This mirrors the ledger's coherence table (movements/domain/validation.py):
 * offering an option the API rejects is offering a 422 dressed up as a choice.
 *
 * - **Goals never appear.** A pocket is a transfer endpoint; nobody spends from
 *   one, and the honest path out is withdrawing to an account first.
 * - **Income accepts accounts only.** Money landing on a card is a refund — a
 *   niche case that lives in Accounts, by moving the debt anchor by hand.
 */
export function sourceOptions(
  byId: Record<string, ResolvedSource>,
  type: MovementDraft['type'],
): ResolvedSource[] {
  const kinds: ResolvedSource['type'][] =
    type === 'income' ? ['account'] : ['account', 'credit_card'];
  return Object.values(byId).filter((source) => kinds.includes(source.type));
}
