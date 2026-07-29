import type { DebtsSnapshot, Deuda, NewDebt, NewSharedEvent } from '../../domain';

export interface DeudasRepository {
  /** `today` is the device's local day: `status` (and so `overdue`) derive from it. */
  getSnapshot(today: string): Promise<DebtsSnapshot>;
  create(input: NewDebt, today: string): Promise<Deuda>;
  /** The dinner, split: answers with the whole fresh snapshot. */
  createSharedEvent(input: NewSharedEvent, today: string): Promise<DebtsSnapshot>;
  remove(id: string): Promise<void>;
  addPayment(id: string, amount: number, today: string, note?: string): Promise<Deuda>;
  removePayment(id: string, paymentId: string, today: string): Promise<Deuda>;
}
