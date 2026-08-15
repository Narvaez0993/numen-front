/**
 * Deudas after the redesign: one side at a time, and a split that still opens.
 *
 * Two things are worth pinning. The first is the total, because it is now
 * derived from the tab rather than shown twice — read the wrong side and the
 * screen tells you confidently that someone owes you money they don't.
 *
 * The second is the shared group. The design draws no group at all, so it would
 * have been easy to flatten a dinner into four unrelated loans; the row and its
 * disclosure are a deliberate departure, and this test is what stops a later
 * tidy-up from removing them by accident.
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { DeudasScreen } from '../DeudasScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

// Both reach the DI container, which wants a configured API URL. Neither is
// part of what the list promises.
jest.mock('../../components/create-flow/NuevaDeudaSheet', () => ({
  NuevaDeudaSheet: () => null,
}));
jest.mock('../../components/DeudaDetailSheet', () => ({
  DeudaDetailSheet: () => null,
}));

const mockDebt = (over: Record<string, unknown>) => ({
  id: 'd1',
  direction: 'incoming',
  counterpartyId: 'andres',
  amount: 100_000,
  paidTotal: 0,
  remaining: 100_000,
  status: 'pending',
  dueOn: null,
  note: null,
  eventId: null,
  writtenOffOn: null,
  payments: [],
  createdAt: '2026-08-01',
  ...over,
});

const mockSnapshot = {
  currency: 'COP',
  today: '2026-08-14',
  owedToMe: { total: 190_000, count: 3 },
  iOwe: { total: 60_000, count: 1 },
  counterparties: [
    { id: 'andres', name: 'Andrés', color: 'mint' },
    { id: 'julian', name: 'Julián', color: 'purple' },
    { id: 'sofia', name: 'Sofía', color: 'coral' },
  ],
  events: [
    { id: 'cena', name: 'Cena del viernes', total: 120_000, occurredOn: '2026-08-10' },
  ],
  debts: [
    mockDebt({ id: 'd1', counterpartyId: 'andres', amount: 70_000, remaining: 70_000 }),
    mockDebt({
      id: 'd2',
      counterpartyId: 'julian',
      eventId: 'cena',
      amount: 60_000,
      remaining: 60_000,
    }),
    mockDebt({
      id: 'd3',
      counterpartyId: 'sofia',
      eventId: 'cena',
      amount: 60_000,
      remaining: 60_000,
    }),
    mockDebt({
      id: 'd4',
      direction: 'outgoing',
      counterpartyId: 'julian',
      amount: 60_000,
      remaining: 60_000,
    }),
  ],
};

// The store detects the currency from the device locale, which under jest is
// not Colombia. Every amount here is in COP minor units.
jest.mock('@/shared/presentation/currency/useCurrencyStore', () => ({
  useCurrencyStore: (select: (state: unknown) => unknown) => select({ currency: 'COP' }),
}));

jest.mock('../../hooks/useDeudas', () => ({
  useDeudas: () => ({
    data: mockSnapshot,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

const mockNoop = () => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false });
jest.mock('../../hooks/useDebtMutations', () => ({
  useDeleteDebt: () => mockNoop(),
  useWriteOffDebt: () => mockNoop(),
  useReopenDebt: () => mockNoop(),
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
        <DeudasScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('the debts list', () => {
  it('leads with the total of the side you are on, and swaps it with the tab', () => {
    mount();

    // The test locale is English, so thousands group with a comma.
    expect(screen.queryByText('190,000')).not.toBeNull();
    expect(screen.queryByText('3 people owe you')).not.toBeNull();

    fireEvent.press(screen.getByText('I owe'));

    expect(screen.queryByText('60,000')).not.toBeNull();
    expect(screen.queryByText('you owe 1 person')).not.toBeNull();
    // The other side's total is gone, not merely pushed down.
    expect(screen.queryByText('190,000')).toBeNull();
  });

  it('keeps a split as one row that opens into its people', () => {
    mount();

    expect(screen.queryByText('Cena del viernes')).not.toBeNull();
    expect(screen.queryByText('2 people')).not.toBeNull();
    // Collapsed: the people inside are not on screen yet.
    expect(screen.queryByText('Sofía')).toBeNull();

    fireEvent.press(screen.getByText('Cena del viernes'));

    expect(screen.queryByText('Julián')).not.toBeNull();
    expect(screen.queryByText('Sofía')).not.toBeNull();
  });

  it('shows only the debts of the side on screen', () => {
    mount();

    // Andrés is owed to me; his row is here and the outgoing one is not.
    expect(screen.queryByText('Andrés')).not.toBeNull();

    fireEvent.press(screen.getByText('I owe'));

    expect(screen.queryByText('Andrés')).toBeNull();
    expect(screen.queryByText('Cena del viernes')).toBeNull();
    expect(screen.queryByText('Julián')).not.toBeNull();
  });
});
