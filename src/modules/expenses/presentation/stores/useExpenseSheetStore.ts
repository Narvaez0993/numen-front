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
  transcript: string | null;
  /** An agent draft being edited: the manual form opens prefilled with it and
   * saving routes through the draft's confirm instead of a plain create. */
  draft: MovementDraft | null;
  openSheet: (
    flow?: SheetFlow,
    initialType?: MovementType,
    draft?: MovementDraft,
  ) => void;
  closeSheet: () => void;
  setFlow: (flow: SheetFlow) => void;
  setMethod: (method: SheetMethod) => void;
  setTranscript: (transcript: string | null) => void;
};

export const useExpenseSheetStore = create<State>((set) => ({
  open: false,
  flow: 'entry',
  initialType: 'expense',
  method: 'voice',
  transcript: null,
  draft: null,
  openSheet: (flow = 'entry', initialType = 'expense', draft) =>
    set({
      open: true,
      flow,
      initialType,
      method: 'voice',
      transcript: null,
      draft: draft ?? null,
    }),
  closeSheet: () =>
    set({
      open: false,
      flow: 'entry',
      initialType: 'expense',
      method: 'voice',
      transcript: null,
      draft: null,
    }),
  setFlow: (flow) => set({ flow }),
  setMethod: (method) => set({ method }),
  setTranscript: (transcript) => set({ transcript }),
}));
