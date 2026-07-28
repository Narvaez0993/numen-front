import type { NewMovement } from '@/modules/movements/domain';

import type { MovementDraft } from '../../../domain/types/Assistant';
import { overridesFromMovement, prefillFromDraft } from '../draftForm';

const draft: MovementDraft = {
  id: 'd-1',
  type: 'expense',
  description: 'Almuerzo',
  amount: 25_000,
  currency: 'COP',
  sourceType: 'account',
  sourceId: 'acc-1',
  destinationType: null,
  destinationId: null,
  categoryId: 'comida',
  occurredOn: '2026-07-27',
  status: 'pending',
  movementId: null,
};

describe('prefillFromDraft', () => {
  it('carries every editable field into the form', () => {
    expect(prefillFromDraft(draft)).toEqual({
      amount: 25_000,
      description: 'Almuerzo',
      categoryId: 'comida',
      source: { type: 'account', id: 'acc-1' },
      destination: null,
      occurredOn: '2026-07-27',
    });
  });

  it('maps a transfer destination when there is one', () => {
    const transfer = prefillFromDraft({
      ...draft,
      type: 'transfer',
      destinationType: 'credit_card',
      destinationId: 'card-1',
      categoryId: null,
    });
    expect(transfer.destination).toEqual({ type: 'credit_card', id: 'card-1' });
  });
});

describe('overridesFromMovement', () => {
  const movement: NewMovement = {
    type: 'expense',
    description: 'Cena',
    amount: 30_000,
    source: { type: 'account', id: 'acc-1' },
    destination: null,
    categoryId: null,
    occurredOn: '2026-07-28',
    capturedVia: 'manual',
  };

  it('sends the full picture, category null included (null clears, absent keeps)', () => {
    const overrides = overridesFromMovement(movement);
    expect(overrides.categoryId).toBeNull();
    expect(overrides.amount).toBe(30_000);
    expect(overrides.sourceType).toBe('account');
    expect(overrides.destinationId).toBeNull();
  });
});
