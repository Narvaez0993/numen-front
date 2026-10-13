/**
 * The chat after the redesign: one answer on screen, the rest behind the count.
 *
 * What is worth pinning is the pair of them together. Showing only the last
 * exchange is the whole point of the new screen, and it is also exactly the
 * change that could quietly lose a conversation — so the test asserts both that
 * the older messages are gone from the screen AND that they are still reachable.
 * Either half alone would pass while the feature was broken.
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { AssistantScreen } from '../AssistantScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

jest.mock('@/shared/presentation/components/GlassTabBar', () => ({
  useFloatingTabBarClearance: () => 0,
}));

jest.mock('@/modules/auth/presentation', () => ({
  useAuthStore: (select: (state: unknown) => unknown) =>
    select({ session: { displayName: 'Sebastián Mejía' } }),
}));

jest.mock('@/modules/plan/presentation/hooks/useTier', () => ({
  useTier: () => 'free',
}));

// The draft cards reach the DI container, which wants a configured API URL.
// Nothing in this test proposes a movement.
jest.mock('../../components/BlockView', () => ({
  BlockView: () => null,
}));

jest.mock('@/modules/expenses/presentation/stores/useExpenseSheetStore', () => ({
  useExpenseSheetStore: (select: (state: unknown) => unknown) =>
    select({ openSheet: jest.fn() }),
}));

const mockMessages = [
  {
    id: 'm1',
    role: 'user',
    blocks: [{ type: 'text', text: '¿cuánto llevo en mercado?' }],
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'm2',
    role: 'assistant',
    blocks: [{ type: 'text', text: 'Llevas $312.000 en mercado este mes.' }],
    createdAt: '2026-08-15T10:00:02Z',
  },
  {
    id: 'm3',
    role: 'user',
    blocks: [{ type: 'text', text: '¿y restaurantes?' }],
    createdAt: '2026-08-15T10:01:00Z',
  },
  {
    id: 'm4',
    role: 'assistant',
    blocks: [{ type: 'text', text: 'En restaurantes vas en $180.000.' }],
    createdAt: '2026-08-15T10:01:02Z',
  },
];

jest.mock('../../hooks/useChatHistory', () => ({
  useChatHistory: () => ({
    data: { messages: mockMessages },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../hooks/useAssistantUsage', () => ({
  useAssistantUsage: () => ({
    data: {
      registrations: { used: 4, limit: 60, grace: 0 },
      messages: { used: 18, limit: 30, grace: 5 },
    },
  }),
}));

const mockIdle = () => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
  variables: undefined,
});
jest.mock('../../hooks/useAssistantMutations', () => ({
  useSendMessage: () => mockIdle(),
  useConfirmDraft: () => mockIdle(),
  useDiscardDraft: () => mockIdle(),
  useConfirmDebtDraft: () => mockIdle(),
  useDiscardDebtDraft: () => mockIdle(),
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
        <AssistantScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('the assistant screen', () => {
  it('shows the last exchange and nothing before it', () => {
    mount();

    expect(screen.queryByText('En restaurantes vas en $180.000.')).not.toBeNull();
    expect(screen.queryByText('¿y restaurantes?')).not.toBeNull();

    // The earlier exchange is off the screen, not merely scrolled away.
    expect(screen.queryByText('Llevas $312.000 en mercado este mes.')).toBeNull();
    expect(screen.queryByText('¿cuánto llevo en mercado?')).toBeNull();
  });

  it('counts the thread, and opens it', () => {
    mount();

    expect(screen.queryByText('18/30 messages')).not.toBeNull();

    fireEvent.press(screen.getByText('18/30 messages'));

    // Everything is in the sheet, including what the screen had dropped.
    expect(screen.queryByText('Llevas $312.000 en mercado este mes.')).not.toBeNull();
    expect(screen.queryByText('¿cuánto llevo en mercado?')).not.toBeNull();
    // And the other quota, which no other screen shows any more.
    expect(screen.queryByText('4/60')).not.toBeNull();
  });
});
