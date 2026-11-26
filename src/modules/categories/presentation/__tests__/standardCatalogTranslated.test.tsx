/**
 * HU-10 «El catálogo está traducido»: in English, the standard categories read
 * in English wherever a category is named — the server only ever sends their
 * Spanish names. The user's own categories keep the name they wrote.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { playAmountLine } from '@/modules/assistant/presentation/components/corte/PlayRow';
import type { AgentPlay } from '@/modules/assistant/domain/types/AgentFeed';
import { ManualSheet } from '@/modules/expenses/presentation/components/ManualSheet';
import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { STANDARD_CATEGORY_IDS } from '../../domain';
import { categoryName } from '../utils/categoryName';

// What `GET /categories` answers: the standard ones in Spanish, plus one of the
// user's own, which has a uuid for an id.
jest.mock('@/core/di/container', () => ({
  container: {
    getCategoriesUseCase: {
      execute: jest.fn(async () => [
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
          icon: 'tools-kitchen-2',
          color: 'pink',
          flow: 'expense',
          isStandard: true,
        },
        {
          id: '7f1c2a9e-1111-4c1e-9a77-0c3b1b2f0d10',
          name: 'Gimnasio',
          icon: 'barbell',
          color: 'purple',
          flow: 'expense',
          isStandard: false,
        },
      ]),
    },
  },
}));

jest.mock('@/modules/accounts/presentation/hooks/useAccounts', () => ({
  useAccounts: () => ({
    data: {
      currency: 'COP',
      accounts: [
        {
          id: 'acc-1',
          kind: 'debit',
          name: 'Bancolombia',
          sub: '',
          icon: 'building-bank',
          color: 'purple',
          currency: 'COP',
          balance: 0,
        },
      ],
      creditCards: [],
    },
  }),
}));

beforeAll(() => {
  useCurrencyStore.setState({ currency: 'COP' });
});

afterAll(async () => {
  await i18n.changeLanguage('es');
});

describe('HU-10 · El catálogo está traducido', () => {
  it('names every standard category in both languages', async () => {
    for (const language of ['es', 'en'] as const) {
      await i18n.changeLanguage(language);
      for (const id of STANDARD_CATEGORY_IDS) {
        const name = categoryName(id, 'x', i18n.t);
        expect(name).not.toBe('x');
        expect(name).not.toContain('categories.standard');
      }
    }
  });

  it('translates a standard category by its id and leaves the user’s own alone', async () => {
    await i18n.changeLanguage('en');
    expect(categoryName('mercado', 'Mercado', i18n.t)).toBe('Groceries');
    expect(categoryName('otro_ingreso', 'Otro', i18n.t)).toBe('Other');
    expect(categoryName('7f1c2a9e', 'Gimnasio', i18n.t)).toBe('Gimnasio');

    await i18n.changeLanguage('es');
    expect(categoryName('comida', 'Comida fuera', i18n.t)).toBe('Comida fuera');
  });

  it('shows the standard categories in English in the category picker', async () => {
    await i18n.changeLanguage('en');
    // No garbage-collection timer left behind once the test is over.
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <ThemeProvider>
            <ManualSheet
              visible
              onSave={jest.fn()}
              onSpeak={jest.fn()}
              onClose={jest.fn()}
            />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>,
    );

    // The first expense category is preselected once the catalog arrives.
    expect(await screen.findByText('Groceries')).toBeTruthy();
    fireEvent.press(screen.getByText('Category'));

    expect(screen.getAllByText('Groceries').length).toBeGreaterThan(1);
    expect(screen.getByText('Eating out')).toBeTruthy();
    expect(screen.getByText('Gimnasio')).toBeTruthy();
    expect(screen.queryByText('Mercado')).toBeNull();
    expect(screen.queryByText('Comida fuera')).toBeNull();
    view.unmount();
    client.clear();
  });

  it('names a category in English in the Corte’s proposals', async () => {
    await i18n.changeLanguage('en');
    const play = {
      id: 'play-1',
      text: '',
      status: 'proposed',
      resultId: null,
      failureCode: null,
      action: 'set_category_cap',
      categoryId: 'comida',
      categoryName: 'Comida fuera',
      target: 300_000,
      linkedGoalId: null,
    } as AgentPlay;

    const line = playAmountLine(play, i18n.t);

    expect(line).toContain('Eating out');
    expect(line).not.toContain('Comida fuera');
  });
});
