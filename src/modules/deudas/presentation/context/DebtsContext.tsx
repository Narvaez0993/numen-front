import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { Counterparty, DebtsSnapshot, Deuda, SharedEvent } from '../../domain';

type DebtsContextValue = {
  snapshot: DebtsSnapshot;
  today: string;
  counterpartyById: Record<string, Counterparty>;
  eventById: Record<string, SharedEvent>;
  debtById: Record<string, Deuda>;
};

const DebtsContext = createContext<DebtsContextValue | null>(null);

/**
 * The loaded snapshot, shared with every card and sheet of the screen.
 *
 * It replaces a zustand store that **held the data** (the same antipattern budgets
 * had): the server's snapshot is the state now, mutations invalidate the query, and
 * this context only saves the prop-drilling — it never owns anything.
 */
export function DebtsProvider({
  snapshot,
  children,
}: {
  snapshot: DebtsSnapshot;
  children: ReactNode;
}) {
  const value = useMemo<DebtsContextValue>(() => {
    const counterpartyById: Record<string, Counterparty> = {};
    for (const person of snapshot.counterparties) counterpartyById[person.id] = person;
    const eventById: Record<string, SharedEvent> = {};
    for (const event of snapshot.events) eventById[event.id] = event;
    const debtById: Record<string, Deuda> = {};
    for (const debt of snapshot.debts) debtById[debt.id] = debt;
    return { snapshot, today: snapshot.today, counterpartyById, eventById, debtById };
  }, [snapshot]);

  return <DebtsContext.Provider value={value}>{children}</DebtsContext.Provider>;
}

export function useDebtsContext(): DebtsContextValue {
  const value = useContext(DebtsContext);
  if (value === null) {
    throw new Error('useDebtsContext outside of DebtsProvider');
  }
  return value;
}
