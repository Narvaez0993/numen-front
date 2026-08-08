/**
 * The bridge between an agent draft and the manual form: editing a draft opens
 * the SAME precise form manual capture uses, and saving routes back through
 * the draft's confirm — one door into the ledger, whoever knocks.
 */

import type { ManualPrefill } from '@/modules/expenses/presentation/components/ManualState';
import type { NewMovement } from '@/modules/movements/domain';

import type { DraftOverrides, MovementDraft } from '../../domain/types/Assistant';

export function prefillFromDraft(draft: MovementDraft): ManualPrefill {
  return {
    amount: draft.amount,
    description: draft.description,
    categoryId: draft.categoryId,
    // A draft without a source leaves the field unset rather than inventing one:
    // the form asks, exactly as the confirm card would have.
    source:
      draft.sourceType !== null && draft.sourceId !== null
        ? { type: draft.sourceType, id: draft.sourceId }
        : undefined,
    destination:
      draft.destinationType !== null && draft.destinationId !== null
        ? { type: draft.destinationType, id: draft.destinationId }
        : null,
    occurredOn: draft.occurredOn,
  };
}

/** The form's full picture becomes explicit overrides — including a cleared
 * category, which travels as `null` on purpose (absent would mean "keep"). */
export function overridesFromMovement(movement: NewMovement): DraftOverrides {
  return {
    type: movement.type,
    description: movement.description,
    amount: movement.amount,
    sourceType: movement.source.type as 'account' | 'credit_card',
    sourceId: movement.source.id,
    destinationType:
      movement.destination !== null
        ? (movement.destination.type as 'account' | 'credit_card')
        : null,
    destinationId: movement.destination?.id ?? null,
    categoryId: movement.categoryId,
    occurredOn: movement.occurredOn,
  };
}
