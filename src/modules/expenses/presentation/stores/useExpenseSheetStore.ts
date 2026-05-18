import { create } from 'zustand';

export type SheetFlow = 'entry' | 'recording' | 'processing' | 'confirm';

type State = {
  open: boolean;
  flow: SheetFlow;
  openSheet: () => void;
  closeSheet: () => void;
  setFlow: (flow: SheetFlow) => void;
};

export const useExpenseSheetStore = create<State>((set) => ({
  open: false,
  flow: 'entry',
  openSheet: () => set({ open: true, flow: 'entry' }),
  closeSheet: () => set({ open: false, flow: 'entry' }),
  setFlow: (flow) => set({ flow }),
}));
