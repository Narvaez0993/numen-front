import type {
  DebtDraft,
  MovementDraft,
} from '@/modules/assistant/domain/types/Assistant';

import { needsAnswers } from '../captureAnswers';

const movement = (overrides: Partial<MovementDraft> = {}): MovementDraft => ({
  id: 'd-1',
  type: 'expense',
  description: 'Café',
  amount: 5_000,
  currency: 'COP',
  sourceType: 'account',
  sourceId: 'acc-1',
  destinationType: null,
  destinationId: null,
  categoryId: null,
  occurredOn: '2026-08-08',
  status: 'pending',
  movementId: null,
  ...overrides,
});

const debt = (overrides: Partial<DebtDraft> = {}): DebtDraft => ({
  id: 'dd-1',
  kind: 'new',
  targetDebtId: null,
  direction: 'incoming',
  counterpartyId: null,
  counterpartyName: 'Santiago',
  amount: 5_000,
  currency: 'COP',
  accountId: 'acc-1',
  dueOn: null,
  note: null,
  status: 'pending',
  debtId: null,
  ...overrides,
});

describe('needsAnswers', () => {
  it('says no when the agent knew everything', () => {
    expect(needsAnswers([movement()], [])).toBe(false);
  });

  it('says yes when a movement has no source', () => {
    // The dangerous direction: saying no here would auto-save money against an
    // account nobody chose.
    expect(needsAnswers([movement({ sourceId: null })], [])).toBe(true);
  });

  it('says yes when a new debt has no account', () => {
    // `null` is "the agent did not hear one", not "no money moved" — that answer
    // only exists once the user gives it.
    expect(needsAnswers([], [debt({ accountId: null })])).toBe(true);
  });

  it('says yes when an abono does not know which debt it pays', () => {
    expect(needsAnswers([], [debt({ kind: 'payment', targetDebtId: null })])).toBe(true);
  });

  it('says no for an abono that knows its debt and its account', () => {
    expect(needsAnswers([], [debt({ kind: 'payment', targetDebtId: 'debt-1' })])).toBe(
      false,
    );
  });

  it('one unanswered draft is enough to ask about the whole capture', () => {
    expect(needsAnswers([movement(), movement({ sourceId: null })], [])).toBe(true);
  });

  it('an empty capture asks nothing', () => {
    expect(needsAnswers([], [])).toBe(false);
  });
});
