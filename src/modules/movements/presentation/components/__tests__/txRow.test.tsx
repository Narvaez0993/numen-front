/**
 * One row of the history, and what it has to say about the movement on it.
 */

import { render, screen } from '@testing-library/react-native';

import { i18n } from '@/shared/infrastructure/i18n';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import type { Movement } from '../../../domain';
import type { ResolvedSource } from '../../hooks/useMovementCatalogs';
import { TxRow } from '../TxRow';

const BANCOLOMBIA: ResolvedSource = {
  id: 'acc-1',
  type: 'account',
  name: 'Bancolombia',
  icon: 'building-bank',
  color: 'purple',
};

const movement = (overrides: Partial<Movement>): Movement => ({
  id: 'mov-1',
  type: 'expense',
  description: 'Almuerzo',
  amount: 25_000,
  currency: 'COP',
  source: { type: 'account', id: 'acc-1' },
  destination: null,
  categoryId: null,
  occurredOn: '2026-11-10',
  capturedVia: 'manual',
  subscriptionId: null,
  ...overrides,
});

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

function renderRow(row: Movement, from?: ResolvedSource) {
  return render(
    <ThemeProvider>
      <TxRow movement={row} category={undefined} source={BANCOLOMBIA} from={from} last />
    </ThemeProvider>,
  );
}

describe('HU-14 · La categoría de ingreso es opcional', () => {
  it('presents an income saved without a category as such', () => {
    renderRow(movement({ type: 'income', description: 'Reembolso', categoryId: null }));

    expect(screen.getByText('Ingreso sin categoría · Bancolombia')).toBeTruthy();
    expect(screen.getByText('+$25.000')).toBeTruthy();
  });

  it('says it in English too', async () => {
    await i18n.changeLanguage('en');
    const view = renderRow(
      movement({ type: 'income', description: 'Refund', categoryId: null }),
    );

    expect(screen.getByText('Uncategorized income · Bancolombia')).toBeTruthy();
    view.unmount();
    await i18n.changeLanguage('es');
  });

  it('does not call an expense without a category an income', () => {
    renderRow(movement({ type: 'expense', categoryId: null }));

    expect(screen.queryByText(/sin categoría/i)).toBeNull();
    expect(screen.getByText('Bancolombia')).toBeTruthy();
  });
});

describe('HU-23 · Los movimientos especiales quedan señalados', () => {
  const NEQUI: ResolvedSource = {
    id: 'acc-2',
    type: 'account',
    name: 'Nequi',
    icon: 'wallet',
    color: 'mint',
  };

  it('marks a transfer as a transfer that does not count as spending', () => {
    renderRow(
      movement({
        type: 'transfer',
        description: 'Bancolombia → Nequi',
        source: { type: 'account', id: 'acc-1' },
        destination: { type: 'account', id: 'acc-2' },
      }),
      NEQUI,
    );

    expect(screen.getByText('Transferencia')).toBeTruthy();
    expect(screen.getByText('No cuenta como gasto')).toBeTruthy();
    // Neither sign: it moved money between the user's own sources.
    expect(screen.getByText('$25.000')).toBeTruthy();
    expect(screen.queryByText('recurrente')).toBeNull();
  });

  it('marks an expense a subscription charged as recurring', () => {
    renderRow(
      movement({
        description: 'Netflix',
        capturedVia: 'recurring',
        subscriptionId: 'sub-netflix',
      }),
    );

    expect(screen.getByText('recurrente')).toBeTruthy();
    expect(screen.getByText('−$25.000')).toBeTruthy();
    expect(screen.queryByText('Transferencia')).toBeNull();
  });

  it('marks neither on an ordinary expense', () => {
    renderRow(movement({ description: 'Almuerzo' }));

    expect(screen.queryByText('recurrente')).toBeNull();
    expect(screen.queryByText('Transferencia')).toBeNull();
  });
});
