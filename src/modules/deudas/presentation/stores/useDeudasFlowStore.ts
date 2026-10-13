import { create } from 'zustand';

import type { DebtDirection } from '../../domain/types/Deuda';

type State = {
  selectedDebtId: string | null;
  createOpen: boolean;
  createDirection: DebtDirection;
};

type Actions = {
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openCreate: (direction?: DebtDirection) => void;
  closeCreate: () => void;
};

export const useDeudasFlowStore = create<State & Actions>((set) => ({
  selectedDebtId: null,
  createOpen: false,
  createDirection: 'incoming',

  openDetail: (id) => set({ selectedDebtId: id }),
  closeDetail: () => set({ selectedDebtId: null }),
  openCreate: (direction = 'incoming') =>
    set({ createOpen: true, createDirection: direction }),
  closeCreate: () => set({ createOpen: false }),
}));
