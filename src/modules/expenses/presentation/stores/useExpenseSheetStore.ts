import { create } from 'zustand';

import type { MovementDraft } from '@/modules/assistant/domain/types/Assistant';
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
  /** The staged draft being confirmed or edited: the manual form opens
   * prefilled with it and saving routes through the draft's confirm. */
  draft: MovementDraft | null;
  /** The agent's one short question when a capture was ambiguous. */
  clarification: string | null;
  /** An honest one-liner for the manual form (e.g. the AI quota ran out). */
  notice: string | null;
  openSheet: (
    flow?: SheetFlow,
    initialType?: MovementType,
    draft?: MovementDraft,
  ) => void;
  closeSheet: () => void;
  setFlow: (flow: SheetFlow) => void;
  setMethod: (method: SheetMethod) => void;
  setTranscript: (transcript: string | null) => void;
  setDraft: (draft: MovementDraft | null) => void;
  setClarification: (clarification: string | null) => void;
  setNotice: (notice: string | null) => void;
};

export const useExpenseSheetStore = create<State>((set) => ({
  open: false,
  flow: 'entry',
  initialType: 'expense',
  method: 'voice',
  transcript: null,
  draft: null,
  clarification: null,
  notice: null,
  openSheet: (flow = 'entry', initialType = 'expense', draft) =>
    set({
      open: true,
      flow,
      initialType,
      method: 'voice',
      transcript: null,
      draft: draft ?? null,
      clarification: null,
      notice: null,
    }),
  closeSheet: () =>
    set({
      open: false,
      flow: 'entry',
      initialType: 'expense',
      method: 'voice',
      transcript: null,
      draft: null,
      clarification: null,
      notice: null,
    }),
  setFlow: (flow) => set({ flow }),
  setMethod: (method) => set({ method }),
  setTranscript: (transcript) => set({ transcript }),
  setDraft: (draft) => set({ draft }),
  setClarification: (clarification) => set({ clarification }),
  setNotice: (notice) => set({ notice }),
}));
