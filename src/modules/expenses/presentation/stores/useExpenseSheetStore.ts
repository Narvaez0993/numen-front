import { create } from 'zustand';

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
  openSheet: (flow?: SheetFlow, initialType?: MovementType) => void;
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
  openSheet: (flow = 'entry', initialType = 'expense') =>
    set({ open: true, flow, initialType, method: 'voice', transcript: null }),
  closeSheet: () =>
    set({
      open: false,
      flow: 'entry',
      initialType: 'expense',
      method: 'voice',
      transcript: null,
    }),
  setFlow: (flow) => set({ flow }),
  setMethod: (method) => set({ method }),
  setTranscript: (transcript) => set({ transcript }),
}));
