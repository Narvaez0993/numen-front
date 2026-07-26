import { create } from 'zustand';

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
  method: SheetMethod;
  transcript: string | null;
  openSheet: (flow?: SheetFlow) => void;
  closeSheet: () => void;
  setFlow: (flow: SheetFlow) => void;
  setMethod: (method: SheetMethod) => void;
  setTranscript: (transcript: string | null) => void;
};

export const useExpenseSheetStore = create<State>((set) => ({
  open: false,
  flow: 'entry',
  method: 'voice',
  transcript: null,
  openSheet: (flow = 'entry') =>
    set({ open: true, flow, method: 'voice', transcript: null }),
  closeSheet: () =>
    set({ open: false, flow: 'entry', method: 'voice', transcript: null }),
  setFlow: (flow) => set({ flow }),
  setMethod: (method) => set({ method }),
  setTranscript: (transcript) => set({ transcript }),
}));
