import type { DebtsSnapshot, Deuda, NewDebt, NewSharedEvent } from '../../domain';

export interface DeudasRepository {
  /** `today` is the device's local day: `status` (and so `overdue`) derive from it. */
  getSnapshot(today: string): Promise<DebtsSnapshot>;
  create(input: NewDebt, today: string): Promise<Deuda>;
  /** The dinner, split: answers with the whole fresh snapshot. */
  createSharedEvent(input: NewSharedEvent, today: string): Promise<DebtsSnapshot>;
  remove(id: string): Promise<void>;
  /** The account is required: a repayment always moves real cash, unlike the loan,
   *  which may never have moved any. */
  addPayment(
    id: string,
    amount: number,
    accountId: string,
    today: string,
    note?: string,
  ): Promise<Deuda>;
  removePayment(id: string, paymentId: string, today: string): Promise<Deuda>;
  /** Gives up on money owed to the user, booking the loss as an expense today. */
  writeOff(id: string, today: string): Promise<Deuda>;
  /** They paid after all: the claim comes back and the loss expense is deleted. */
  reopen(id: string, today: string): Promise<Deuda>;
}
