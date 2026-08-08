import type { ResolvedSource } from '@/modules/movements/presentation/hooks/useMovementCatalogs';

import { sourceOptions } from '../draftSources';

const CATALOG: Record<string, ResolvedSource> = {
  nequi: { id: 'nequi', type: 'account', name: 'Nequi', icon: 'wallet', color: 'mint' },
  visa: {
    id: 'visa',
    type: 'credit_card',
    name: 'Visa',
    icon: 'credit-card',
    color: 'coral',
  },
  japon: {
    id: 'japon',
    type: 'goal',
    name: 'Viaje a Japón',
    icon: 'target',
    color: 'amber',
  },
};

const names = (sources: ResolvedSource[]) => sources.map((source) => source.name);

describe('sourceOptions', () => {
  it('offers accounts and cards to an expense', () => {
    expect(names(sourceOptions(CATALOG, 'expense'))).toEqual(['Nequi', 'Visa']);
  });

  it('offers only accounts to an income', () => {
    // The ledger rejects income onto a card, so the picker must not suggest one:
    // the user would tap Visa, confirm, and get a 422 for following the UI.
    expect(names(sourceOptions(CATALOG, 'income'))).toEqual(['Nequi']);
  });

  it('offers accounts and cards to a transfer', () => {
    expect(names(sourceOptions(CATALOG, 'transfer'))).toEqual(['Nequi', 'Visa']);
  });

  it('never offers a goal — a pocket is not something you spend from', () => {
    for (const type of ['expense', 'income', 'transfer'] as const) {
      expect(names(sourceOptions(CATALOG, type))).not.toContain('Viaje a Japón');
    }
  });
});
