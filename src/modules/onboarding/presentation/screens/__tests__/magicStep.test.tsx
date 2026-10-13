/**
 * The setup's first expense, for real: understood, saved on the account the
 * step before created, and shown as the card «Ya quedó» promised.
 *
 * Driven through the written path, because that is the one a test (and a
 * simulator, which has no recognizer) can reach: the voice path ends in the
 * same `understand`, with the transcript instead of the typed text.
 */

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Account } from '@/modules/accounts/domain';
import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';
import { toIsoDate } from '@/shared/presentation/utils/dates';

import { MagicStep } from '../MagicStep';

const mockParse = jest.fn();
const mockConfirm = jest.fn();

jest.mock('@/modules/assistant/presentation/hooks/useAssistantMutations', () => ({
  useParseCapture: () => ({ mutateAsync: mockParse }),
  useConfirmDraft: () => ({ mutateAsync: mockConfirm }),
}));

jest.mock('@/modules/categories/presentation/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: 'cat-cafe', name: 'Café', icon: 'coffee', color: 'amber', flow: 'expense' },
    ],
  }),
}));

// No recognizer, as on a simulator: the orb offers to write it instead.
jest.mock('@/shared/presentation/voice/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    status: 'idle',
    level: 0,
    transcript: '',
    permission: 'unknown',
    errorCode: null,
    start: jest.fn(async () => false),
    stop: jest.fn(),
    abort: jest.fn(),
  }),
}));

const account: Account = {
  id: 'acc-1',
  kind: 'debit',
  name: 'Bancolombia',
  sub: '',
  icon: 'building-bank',
  color: 'purple',
  currency: 'COP',
  balance: 1_200_000,
};

const today = toIsoDate(new Date());

function draft(overrides: Record<string, unknown> = {}) {
  return {
    id: 'draft-1',
    type: 'expense',
    description: 'Café',
    amount: 5000,
    currency: 'COP',
    sourceType: 'account',
    sourceId: 'acc-1',
    destinationType: null,
    destinationId: null,
    categoryId: 'cat-cafe',
    occurredOn: today,
    status: 'pending',
    movementId: null,
    ...overrides,
  };
}

function renderMagic(onDone = jest.fn()) {
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <MagicStep account={account} onDone={onDone} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
  return onDone;
}

async function writeIt(text: string) {
  await act(async () => {
    fireEvent.press(screen.getByText('Toca y habla'));
  });
  fireEvent.changeText(screen.getByPlaceholderText('un café de cinco mil'), text);
  await act(async () => {
    fireEvent.press(screen.getByText('Listo'));
  });
}

beforeAll(async () => {
  await i18n.changeLanguage('es');
  useCurrencyStore.setState({ currency: 'COP' });
});

beforeEach(() => {
  mockParse.mockReset();
  mockConfirm.mockReset();
});

describe('MagicStep', () => {
  it('asks for the first expense, with a way out', () => {
    const onDone = renderMagic();

    expect(screen.getByText('Cuéntame algo que hayas gastado hoy.')).toBeTruthy();
    fireEvent.press(screen.getByText('Después'));
    expect(onDone).toHaveBeenCalled();
  });

  it('without a microphone, offers to write it', async () => {
    renderMagic();
    await act(async () => {
      fireEvent.press(screen.getByText('Toca y habla'));
    });
    expect(
      screen.getByText('Aquí no te puedo escuchar, pero puedes escribírmelo.'),
    ).toBeTruthy();
  });

  it('saves what it understood and shows it as «Ya quedó»', async () => {
    mockParse.mockResolvedValue({
      drafts: [draft()],
      debtDrafts: [],
      clarification: null,
      notice: null,
    });
    mockConfirm.mockImplementation(async ({ draftId }: { draftId: string }) => ({
      draft: draft({ id: draftId, status: 'confirmed', movementId: 'mov-1' }),
      movementId: 'mov-1',
    }));

    renderMagic();
    await writeIt('un café de cinco mil');

    expect(mockParse).toHaveBeenCalledWith({
      text: 'un café de cinco mil',
      source: 'text',
    });
    expect(mockConfirm).toHaveBeenCalledWith({
      draftId: 'draft-1',
      overrides: undefined,
    });
    expect(screen.getByText('Ya quedó guardado')).toBeTruthy();
    expect(screen.getByText('«un café de cinco mil»')).toBeTruthy();
    expect(screen.getByText('−$5.000')).toBeTruthy();
    expect(screen.getByText('Bancolombia')).toBeTruthy();
    expect(screen.getByText('Hoy')).toBeTruthy();
  });

  it('puts a movement the agent left without an account on the new one', async () => {
    mockParse.mockResolvedValue({
      drafts: [draft({ sourceType: null, sourceId: null })],
      debtDrafts: [],
      clarification: null,
      notice: null,
    });
    mockConfirm.mockResolvedValue({
      draft: draft({ status: 'confirmed', movementId: 'mov-1' }),
      movementId: 'mov-1',
    });

    renderMagic();
    await writeIt('un café de cinco mil');

    expect(mockConfirm).toHaveBeenCalledWith({
      draftId: 'draft-1',
      overrides: { sourceType: 'account', sourceId: 'acc-1' },
    });
  });

  it('asks again when it understood no expense', async () => {
    mockParse.mockResolvedValue({
      drafts: [],
      debtDrafts: [],
      clarification: null,
      notice: null,
    });

    renderMagic();
    await writeIt('hola');

    expect(screen.getByText('No te entendí un gasto.')).toBeTruthy();
    expect(mockConfirm).not.toHaveBeenCalled();
  });
});
