import type {
  DebtDraft,
  MovementDraft,
} from '@/modules/assistant/domain/types/Assistant';

/**
 * Does this capture still need the user to answer something?
 *
 * The whole flow hangs off this one question. Nothing pending means the agent knew
 * everything, so the capture saves itself and offers an undo — speaking costs one
 * breath. Anything pending opens a screen, because being asked deserves room.
 *
 * The rule per kind is "what would the confirm card ask":
 *
 * - a movement needs to know where the money moved;
 * - a NEW debt needs an account too — and `null` there is genuinely unknown, not
 *   "no money moved". That answer only exists once the user gives it;
 * - an ABONO needs both which debt it pays and where the cash landed.
 *
 * Getting this wrong in the permissive direction is the dangerous one: it would
 * auto-save a movement against an account nobody chose.
 */
export function needsAnswers(
  drafts: readonly MovementDraft[],
  debtDrafts: readonly DebtDraft[],
): boolean {
  return (
    drafts.some((draft) => draft.sourceId === null) ||
    debtDrafts.some(
      (draft) =>
        draft.accountId === null ||
        (draft.kind === 'payment' && draft.targetDebtId === null),
    )
  );
}
