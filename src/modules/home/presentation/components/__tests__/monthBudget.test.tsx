/**
 * HU-25 «Nunca una figura sin datos» and HU-29 «Sin tope definido no hay cifra
 * diaria»: with no ceiling, Home draws no bar and no daily figure, and offers
 * to set one — in the same sheet Presupuesto creates and edits it with.
 */

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import type { BudgetCap } from '../../../domain/types/HomeOverview';
import { MonthBudget } from '../MonthBudget';

const mockCreate = jest.fn();
jest.mock('@/modules/budgets/presentation/hooks/useBudgetMutations', () => ({
  useCreateBudget: () => ({ mutateAsync: mockCreate, isPending: false }),
}));

const CAP: BudgetCap = {
  target: 3_000_000,
  spent: 1_500_000,
  remaining: 1_500_000,
  used: 0.5,
  perDay: 75_000,
  projected: null,
  over: null,
};

beforeAll(async () => {
  await i18n.changeLanguage('es');
  useCurrencyStore.setState({ currency: 'COP' });
});

beforeEach(() => mockCreate.mockReset());

function mount(budget: BudgetCap | null) {
  const onOpenBudgets = jest.fn();
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <MonthBudget
          budget={budget}
          daysLeft={20}
          elapsed={0.33}
          today="2026-11-10"
          currency="COP"
          onOpenBudgets={onOpenBudgets}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
  return onOpenBudgets;
}

describe('HU-25 · Nunca una figura sin datos / HU-29 · Sin tope definido no hay cifra diaria', () => {
  it('draws no bar and no daily figure, and offers to set a ceiling', () => {
    mount(null);

    expect(screen.queryByText('Te queda')).toBeNull();
    expect(screen.queryByText(/por día/)).toBeNull();
    expect(screen.queryByText(/\$/)).toBeNull();
    expect(screen.getByText('Ponerle un techo al mes')).toBeTruthy();
  });

  it('opens the ceiling sheet and creates the month’s ceiling from Home', async () => {
    mount(null);

    fireEvent.press(screen.getByText('Ponerle un techo al mes'));
    expect(screen.getByText('Tu techo de noviembre')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('3'));
    fireEvent.press(screen.getByLabelText('000'));
    fireEvent.press(screen.getByLabelText('000'));
    await act(async () => {
      fireEvent.press(screen.getByText('Guardar'));
    });

    expect(mockCreate).toHaveBeenCalledWith({ scope: 'global', target: 3_000_000 });
  });

  it('shows the pulse, with its daily figure, once there is a ceiling', () => {
    const onOpenBudgets = mount(CAP);

    expect(screen.getByText('Te queda')).toBeTruthy();
    expect(screen.getByText('$75.000')).toBeTruthy();
    expect(screen.queryByText('Ponerle un techo al mes')).toBeNull();
    fireEvent.press(screen.getByText('Te queda'));
    expect(onOpenBudgets).toHaveBeenCalled();
  });
});
