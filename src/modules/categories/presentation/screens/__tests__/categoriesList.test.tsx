/**
 * The categories list, which the redesign turned from two groups into one.
 *
 * What is worth pinning is the ordering and the subtitles, because both are
 * derived from three sources that know nothing about each other — the catalog,
 * the month's summary and the caps — and a mistake in the join shows up as a
 * plausible-looking list rather than as an error.
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { CategoriesScreen } from '../CategoriesScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

jest.mock('../../components/CategoryFormSheet', () => ({
  CategoryFormSheet: () => null,
}));

// The auth barrel pulls the DI container, which wants a configured API URL. Only
// the tier is read here.
jest.mock('@/modules/auth/presentation', () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ session: { tier: 'free' } }),
}));

jest.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      {
        id: 'mercado',
        name: 'Mercado',
        icon: 'shopping-cart',
        color: 'mint',
        flow: 'expense',
        isStandard: true,
      },
      {
        id: 'comida',
        name: 'Comida fuera',
        icon: 'tools-kitchen',
        color: 'coral',
        flow: 'expense',
        isStandard: true,
      },
      {
        id: 'salud',
        name: 'Salud',
        icon: 'heart',
        color: 'pink',
        flow: 'expense',
        isStandard: true,
      },
      {
        id: 'mia',
        name: 'Mía',
        icon: 'star',
        color: 'purple',
        flow: 'expense',
        isStandard: false,
      },
    ],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/modules/movements/presentation/hooks/useMovementsSummary', () => ({
  useMovementsSummary: () => ({
    data: {
      byCategory: [
        { categoryId: 'mercado', spent: 100_000, count: 4 },
        { categoryId: 'comida', spent: 400_000, count: 9 },
        // `salud` and `mia` are untouched this month.
      ],
    },
    isLoading: false,
  }),
}));

jest.mock('@/modules/budgets/presentation/hooks/useBudgets', () => ({
  useBudgets: () => ({
    data: {
      categories: [
        // Under its cap.
        { categoryId: 'mercado', target: 620_000, remaining: 520_000 },
        // Past it.
        { categoryId: 'comida', target: 300_000, remaining: -100_000 },
      ],
    },
  }),
}));

const noop = () => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false });
jest.mock('../../hooks/useCreateCategory', () => ({ useCreateCategory: () => noop() }));
jest.mock('../../hooks/useUpdateCategory', () => ({ useUpdateCategory: () => noop() }));
jest.mock('../../hooks/useDeleteCategory', () => ({ useDeleteCategory: () => noop() }));

function mount() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <CategoriesScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('the categories list', () => {
  it('says what each category is measured against', () => {
    mount();

    // A cap, how far past one, none at all, and never used — the four things a
    // subtitle can say, each from a different pair of sources.
    // The amount's formatting belongs to formatMoney, not to this screen.
    expect(screen.queryByText(/^Cap /)).not.toBeNull();
    expect(screen.queryByText('Past its cap')).not.toBeNull();
    expect(screen.queryAllByText('No movements').length).toBe(2);
  });

  it('states the plan capacity before the button, not after it', () => {
    mount();

    // One custom category ("Mía") against the free limit of two, said plainly
    // under the create button rather than fired as an error afterwards.
    expect(screen.queryByText('1 of your own, of 2 on the free plan')).not.toBeNull();
  });

  it('drops what the search does not match', () => {
    mount();

    fireEvent.changeText(screen.getByPlaceholderText(/Search|Buscar/i), 'merc');

    expect(screen.queryByText('Mercado')).not.toBeNull();
    expect(screen.queryByText('Comida fuera')).toBeNull();
  });
});
