import { create } from 'zustand';

import type { DebtDirection } from '../../domain/types/Deuda';

type State = {
  selectedDebtId: string | null;
  abonoForId: string | null;
  createOpen: boolean;
  createDirection: DebtDirection;
};

type Actions = {
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openAbono: (id: string) => void;
  closeAbono: () => void;
  openCreate: (direction?: DebtDirection) => void;
  closeCreate: () => void;
};

export const useDeudasFlowStore = create<State & Actions>((set) => ({
  selectedDebtId: null,
  abonoForId: null,
  createOpen: false,
  createDirection: 'incoming',

  openDetail: (id) => set({ selectedDebtId: id }),
  closeDetail: () => set({ selectedDebtId: null }),
  openAbono: (id) => set({ abonoForId: id }),
  closeAbono: () => set({ abonoForId: null }),
  openCreate: (direction = 'incoming') =>
    set({ createOpen: true, createDirection: direction }),
  closeCreate: () => set({ createOpen: false }),
}));
