/**
 * The detail of one movement — the design's `DETALLE`.
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/shared/infrastructure/i18n';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import type { Movement } from '../../../domain';
import type { MovementCatalogs } from '../../hooks/useMovementCatalogs';
import { MovementDetailSheet } from '../MovementDetailSheet';

jest.mock('@/modules/categories/presentation/hooks/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}));

const CATALOGS: MovementCatalogs = {
  categoryById: {},
  sourceById: {
    'acc-1': {
      id: 'acc-1',
      type: 'account',
      name: 'Bancolombia',
      icon: 'building-bank',
      color: 'purple',
    },
  },
  isLoading: false,
  isError: false,
};

const INCOME: Movement = {
  id: 'mov-1',
  type: 'income',
  description: 'Reembolso',
  amount: 80_000,
  currency: 'COP',
  source: { type: 'account', id: 'acc-1' },
  destination: null,
  categoryId: null,
  occurredOn: '2026-11-10',
  capturedVia: 'manual',
  subscriptionId: null,
};

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

function mountDetail(
  movement: Movement,
  handlers: { onDelete?: () => void; onSave?: () => void } = {},
) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <MovementDetailSheet
          visible
          movement={movement}
          catalogs={CATALOGS}
          onClose={jest.fn()}
          onSave={handlers.onSave ?? jest.fn()}
          onDelete={handlers.onDelete ?? jest.fn()}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('HU-14 · La categoría de ingreso es opcional', () => {
  it('shows an income without a category as «Ingreso sin categoría»', () => {
    mountDetail(INCOME);

    expect(screen.getByText('Ingreso sin categoría')).toBeTruthy();
    expect(screen.getByText('Bancolombia')).toBeTruthy();
  });
});

describe('HU-24 · Confirmación antes de borrar', () => {
  const LUNCH: Movement = {
    ...INCOME,
    id: 'mov-2',
    type: 'expense',
    description: 'Almuerzo',
    amount: 25_000,
  };

  it('asks by name first, and only the confirmation deletes', () => {
    const onDelete = jest.fn();
    mountDetail(LUNCH, { onDelete });

    fireEvent.press(screen.getByText('Borrar movimiento'));

    expect(screen.getByText('¿Borro «Almuerzo»?')).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Sí, bórralo'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('deletes nothing when the answer is «Mejor no»', () => {
    const onDelete = jest.fn();
    mountDetail(LUNCH, { onDelete });

    fireEvent.press(screen.getByText('Borrar movimiento'));
    fireEvent.press(screen.getByText('Mejor no'));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('¿Borro «Almuerzo»?')).toBeNull();
    expect(screen.getByText('Borrar movimiento')).toBeTruthy();
  });
});
