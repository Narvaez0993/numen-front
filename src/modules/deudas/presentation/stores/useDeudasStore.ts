import { create } from 'zustand';

import {
  type Counterparty,
  type DebtsSnapshot,
  type Deuda,
  type DebtDirection,
  type Payment,
  type SharedEvent,
  debtStatus,
} from '../../domain/types/Deuda';

type State = {
  initialized: boolean;
  today: string;
  counterparties: Counterparty[];
  debts: Deuda[];
  events: SharedEvent[];
};

type Actions = {
  init: (snapshot: DebtsSnapshot) => void;
  addCounterparty: (c: Counterparty) => void;
  addDeuda: (d: Deuda) => void;
  addSharedEvent: (event: SharedEvent, debts: Deuda[]) => void;
  registerPayment: (debtId: string, payment: Payment) => void;
};

export const useDeudasStore = create<State & Actions>((set) => ({
  initialized: false,
  today: new Date().toISOString().slice(0, 10),
  counterparties: [],
  debts: [],
  events: [],

  init: (snapshot) =>
    set({
      initialized: true,
      today: snapshot.today,
      counterparties: snapshot.counterparties,
      debts: snapshot.debts,
      events: snapshot.events,
    }),

  addCounterparty: (c) =>
    set((s) =>
      s.counterparties.find((x) => x.id === c.id)
        ? s
        : { counterparties: [...s.counterparties, c] },
    ),

  addDeuda: (d) => set((s) => ({ debts: [d, ...s.debts] })),

  addSharedEvent: (event, debts) =>
    set((s) => ({
      events: [event, ...s.events],
      debts: [...debts, ...s.debts],
    })),

  registerPayment: (debtId, payment) =>
    set((s) => ({
      debts: s.debts.map((d) => {
        if (d.id !== debtId) return d;
        const newBalance = Math.max(0, d.balance - payment.amount);
        return {
          ...d,
          balance: newBalance,
          payments: [...d.payments, payment],
        };
      }),
    })),
}));

// ─── Selectors ───────────────────────────────────────────────

export function selectActiveDebtsByDirection(
  state: State,
  direction: DebtDirection,
): Deuda[] {
  return state.debts.filter(
    (d) => d.direction === direction && debtStatus(d, state.today) !== 'paid',
  );
}

export function selectCounterparty(state: State, id: string): Counterparty | undefined {
  return state.counterparties.find((c) => c.id === id);
}

export function selectEvent(state: State, id: string): SharedEvent | undefined {
  return state.events.find((e) => e.id === id);
}

export function selectDeuda(state: State, id: string): Deuda | undefined {
  return state.debts.find((d) => d.id === id);
}

export function selectAllActiveDebts(state: State): Deuda[] {
  return state.debts.filter((d) => debtStatus(d, state.today) !== 'paid');
}
