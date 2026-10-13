import { create } from 'zustand';

import type {
  CapturedRecord,
  DebtDraft,
  MovementDraft,
} from '@/modules/assistant/domain/types/Assistant';
import type { MovementType } from '@/modules/movements/domain';

export type SheetFlow =
  | 'entry'
  | 'recording'
  | 'processing'
  | 'writing'
  | 'photo'
  | 'manual'
  | 'confirm';

export type SheetMethod = 'voice' | 'text' | 'photo';

type State = {
  open: boolean;
  flow: SheetFlow;
  /** Which tab the manual form opens on — "registra un ingreso" should land on
   * the income form, not on an expense the user has to switch. */
  initialType: MovementType;
  method: SheetMethod;
  /** What the mic heard — the «Dijiste "…"» echo of the confirm state. */
  transcript: string | null;
  /** Everything one capture staged, waiting for a yes. A list because a single
   * breath can hold several expenses; each card settles on its own and leaves
   * the queue, and the sheet closes when the last one does. */
  drafts: MovementDraft[];
  /** Debts from the same capture. A separate queue because lending is not
   * spending: its card asks for a person, not a category. */
  debtDrafts: DebtDraft[];
  /** The single draft the manual form is editing — a different job from the
   * queue above: saving the form confirms THIS draft through its overrides. */
  editing: MovementDraft | null;
  /** The agent's one short question when a capture was ambiguous. */
  clarification: string | null;
  /** An honest one-liner for the manual form (e.g. the AI quota ran out). */
  notice: string | null;
  /** Ids from the most recent parse, when it ADDED to a list that already had
   *  cards. They get the accent border, which is the only way to tell what just
   *  landed in a list you are already reading. */
  freshIds: string[];
  /** What a capture just saved without asking — the toast's undo works off this.
   *  Survives `closeSheet`, because the toast outlives the sheet by design. */
  saved: CapturedRecord[] | null;
  openSheet: (
    flow?: SheetFlow,
    initialType?: MovementType,
    draft?: MovementDraft,
  ) => void;
  closeSheet: () => void;
  setFlow: (flow: SheetFlow) => void;
  setMethod: (method: SheetMethod) => void;
  setTranscript: (transcript: string | null) => void;
  setDrafts: (drafts: MovementDraft[]) => void;
  setDebtDrafts: (drafts: DebtDraft[]) => void;
  /** Drops a settled draft from the queue — confirmed and discarded both leave. */
  settleDraft: (draftId: string) => void;
  settleDebtDraft: (draftId: string) => void;
  setEditing: (draft: MovementDraft | null) => void;
  setClarification: (clarification: string | null) => void;
  setNotice: (notice: string | null) => void;
  setFreshIds: (ids: string[]) => void;
  setSaved: (saved: CapturedRecord[] | null) => void;
};

export const useExpenseSheetStore = create<State>((set) => ({
  open: false,
  flow: 'entry',
  initialType: 'expense',
  method: 'voice',
  transcript: null,
  drafts: [],
  debtDrafts: [],
  editing: null,
  clarification: null,
  notice: null,
  freshIds: [],
  saved: null,
  openSheet: (flow = 'entry', initialType = 'expense', draft) =>
    set({
      open: true,
      flow,
      initialType,
      method: 'voice',
      transcript: null,
      drafts: [],
      debtDrafts: [],
      editing: draft ?? null,
      clarification: null,
      notice: null,
      freshIds: [],
      saved: null,
    }),
  closeSheet: () =>
    set({
      open: false,
      flow: 'entry',
      initialType: 'expense',
      method: 'voice',
      transcript: null,
      drafts: [],
      debtDrafts: [],
      editing: null,
      clarification: null,
      notice: null,
      freshIds: [],
    }),
  setFlow: (flow) => set({ flow }),
  setMethod: (method) => set({ method }),
  setTranscript: (transcript) => set({ transcript }),
  setDrafts: (drafts) => set({ drafts }),
  setDebtDrafts: (debtDrafts) => set({ debtDrafts }),
  settleDraft: (draftId) =>
    set((state) => ({ drafts: state.drafts.filter((entry) => entry.id !== draftId) })),
  settleDebtDraft: (draftId) =>
    set((state) => ({
      debtDrafts: state.debtDrafts.filter((entry) => entry.id !== draftId),
    })),
  setEditing: (draft) => set({ editing: draft }),
  setClarification: (clarification) => set({ clarification }),
  setNotice: (notice) => set({ notice }),
  setFreshIds: (freshIds) => set({ freshIds }),
  setSaved: (saved) => set({ saved }),
}));
