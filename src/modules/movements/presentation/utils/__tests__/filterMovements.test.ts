/**
 * HU-23 «Filtro combinado»: type «gasto», category «Transporte» and source
 * «Visa» at once leave only the movements that meet all three.
 */

import { emptyFilters } from '../../../application';
import type { Movement } from '../../../domain';
import type { MovementCatalogs } from '../../hooks/useMovementCatalogs';
import { filterMovements } from '../filterMovements';

const CATALOGS: MovementCatalogs = {
  categoryById: {
    transporte: { id: 'transporte', name: 'Transporte', icon: 'car', color: 'purple' },
    mercado: { id: 'mercado', name: 'Mercado', icon: 'shopping-cart', color: 'mint' },
  },
  sourceById: {
    visa: { id: 'visa', type: 'credit_card', name: 'Visa', icon: 'card', color: 'coral' },
    nequi: { id: 'nequi', type: 'account', name: 'Nequi', icon: 'wallet', color: 'mint' },
  },
  isLoading: false,
  isError: false,
};

const mov = (id: string, overrides: Partial<Movement>): Movement => ({
  id,
  type: 'expense',
  description: id,
  amount: 10_000,
  currency: 'COP',
  source: { type: 'credit_card', id: 'visa' },
  destination: null,
  categoryId: 'transporte',
  occurredOn: '2026-11-10',
  capturedVia: 'manual',
  subscriptionId: null,
  ...overrides,
});

const MONTH: Movement[] = [
  mov('uber-visa', {}),
  mov('taxi-visa', { amount: 22_000 }),
  mov('bus-nequi', { source: { type: 'account', id: 'nequi' } }),
  mov('mercado-visa', { categoryId: 'mercado' }),
  mov('reembolso-visa', { type: 'income', source: { type: 'account', id: 'nequi' } }),
  mov('pago-visa', {
    type: 'transfer',
    categoryId: null,
    source: { type: 'account', id: 'nequi' },
    destination: { type: 'credit_card', id: 'visa' },
  }),
];

describe('HU-23 · Filtro combinado', () => {
  it('keeps only what is an expense, in Transporte and on the Visa', () => {
    const result = filterMovements(
      MONTH,
      { ...emptyFilters, type: 'expense', categoryId: 'transporte', sourceId: 'visa' },
      CATALOGS,
    );

    expect(result.map((m) => m.id)).toEqual(['uber-visa', 'taxi-visa']);
  });

  it('drops a movement that misses any one of the three', () => {
    const result = filterMovements(
      MONTH,
      { ...emptyFilters, type: 'expense', categoryId: 'transporte', sourceId: 'visa' },
      CATALOGS,
    );
    const ids = result.map((m) => m.id);

    expect(ids).not.toContain('bus-nequi'); // other source
    expect(ids).not.toContain('mercado-visa'); // other category
    expect(ids).not.toContain('pago-visa'); // other type, though it lands on the Visa
  });

  it('narrows the combination further with the search text', () => {
    const result = filterMovements(
      MONTH,
      {
        ...emptyFilters,
        query: 'taxi',
        type: 'expense',
        categoryId: 'transporte',
        sourceId: 'visa',
      },
      CATALOGS,
    );

    expect(result.map((m) => m.id)).toEqual(['taxi-visa']);
  });
});
