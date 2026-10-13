/**
 * Starting to watch a category.
 *
 * It broke silently once: picking a candidate closed the picker and opened
 * nothing, so the only way to cap a category was a dead end with no error. Every
 * part passed in isolation — the picker fired its callback, the cap form
 * rendered when handed a category — because the break was in the choreography
 * between two `Modal`s on a timer.
 *
 * There is no timer now, and this test proves it: it advances no clock. If a
 * future change reintroduces a handoff, this goes red.
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { BudgetsScreen } from '../BudgetsScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

// The create flow reaches the DI container, which wants a configured API URL.
// It is not part of this flow — stub the whole thing out.
jest.mock('../../components/create-flow/BudgetCreateFlow', () => ({
  BudgetCreateFlow: () => null,
}));

jest.mock('@/shared/presentation/components/GlassTabBar', () => ({
  useFloatingTabBarClearance: () => 0,
}));

const CAP = {
  id: 'cap-mercado',
  categoryId: 'mercado',
  target: 550_000,
  spent: 5_000,
  remaining: 545_000,
  used: 0.009,
  perDay: 1000,
  projected: null,
  over: null,
  count: 1,
  topMerchants: [],
};

jest.mock('../../hooks/useBudgets', () => ({
  useBudgets: () => ({
    data: {
      currency: 'COP',
      period: '2026-08',
      daysLeft: 21,
      daysElapsed: 10,
      month: {
        id: 'cap-month',
        target: 3_000_000,
        spent: 117_000,
        remaining: 2_883_000,
        used: 0.039,
        perDay: 137_285,
        projected: 302_250,
        over: null,
      },
      categories: [CAP],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/modules/movements/presentation/hooks/useMovementsSummary', () => ({
  useMovementsSummary: () => ({ data: { byCategory: [] } }),
}));

jest.mock('@/modules/goals/presentation/hooks/useGoals', () => ({
  useGoals: () => ({ data: { goals: [] } }),
}));

jest.mock('@/modules/categories/presentation/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      {
        id: 'mercado',
        name: 'Mercado',
        icon: 'shopping-cart',
        color: 'mint',
        flow: 'expense',
      },
      {
        id: 'transporte',
        name: 'Transporte',
        icon: 'car',
        color: 'purple',
        flow: 'expense',
      },
    ],
  }),
}));

const noopMutation = () => ({
  mutateAsync: jest.fn(),
  mutate: jest.fn(),
  isPending: false,
});
jest.mock('../../hooks/useBudgetMutations', () => ({
  useCreateBudget: () => noopMutation(),
  useUpdateBudget: () => noopMutation(),
  useDeleteBudget: () => noopMutation(),
}));

function mount() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <BudgetsScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('watching a new category', () => {
  it('shows the cap form for the category picked, in the same sheet', () => {
    mount();

    // The test locale is English.
    fireEvent.press(screen.getByText('Watch another category'));
    // Transporte is the only unwatched candidate; Mercado already has a cap.
    fireEvent.press(screen.getByText('Transporte'));

    // The cap form's own copy, with no clock advanced: nothing had to close
    // first, so there is no window in which this could fail to appear.
    expect(screen.queryByText('Cap for Transporte')).not.toBeNull();
    expect(screen.queryByText('Monthly cap')).not.toBeNull();
    expect(screen.queryByText('Activate cap')).not.toBeNull();
    // And the picker is gone rather than layered behind it.
    expect(screen.queryByText('Watch a category')).toBeNull();
  });
});
