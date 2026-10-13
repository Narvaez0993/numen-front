/**
 * The welcome on a cheap phone: what has to stay true for it to run smoothly.
 *
 * The orb animates for as long as the screen is up, and the demo under it
 * changes every few hundred milliseconds. If the demo's state ever moved up
 * into the screen, every word would re-render the orb — SVG, layers and all —
 * and a low-end phone would feel it. So the test counts: through greeting and
 * demo, the orb renders at most twice (on mount, and when the greeting hands
 * over to the demo).
 */

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/shared/infrastructure/i18n';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { parseGreeting } from '../../components/TypedGreeting';
import { WelcomeScreen } from '../WelcomeScreen';

const mockOrbRenders = jest.fn();

jest.mock('../../components/WelcomeOrb', () => ({
  WelcomeOrb: () => {
    mockOrbRenders();
    return null;
  },
}));

/** In short steps, each in its own `act`: every step schedules the next one
 *  from an effect, and effects only run when an `act` ends. */
function advance(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += 20) {
    act(() => {
      jest.advanceTimersByTime(Math.min(20, ms - elapsed));
    });
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

beforeEach(() => {
  jest.useFakeTimers();
  mockOrbRenders.mockClear();
});
afterEach(() => jest.useRealTimers());

function renderWelcome(onStart = jest.fn()) {
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <WelcomeScreen onStart={onStart} onHaveAccount={jest.fn()} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
  return onStart;
}

describe('parseGreeting', () => {
  it('splits the lines and keeps the bold run', () => {
    expect(parseGreeting('Hola.\nSoy <b>Deshka</b>.')).toEqual([
      [{ text: 'Hola.', bold: false }],
      [
        { text: 'Soy ', bold: false },
        { text: 'Deshka', bold: true },
        { text: '.', bold: false },
      ],
    ]);
  });
});

describe('WelcomeScreen', () => {
  it('types the greeting, then starts the demo', () => {
    renderWelcome();

    expect(screen.queryByText('Deshka')).toBeNull();
    advance(3000);
    expect(screen.getByText('Deshka')).toBeTruthy();
    expect(screen.getByText('Te escucho')).toBeTruthy();
  });

  it('never re-renders the orb while the demo runs', () => {
    renderWelcome();

    // The greeting, then two full turns of the demo.
    advance(3000 + 2 * 5000);

    expect(screen.getByText('Te escucho')).toBeTruthy();
    expect(mockOrbRenders.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('starts the account from «Empezar»', () => {
    const onStart = renderWelcome();
    fireEvent.press(screen.getByText('Empezar'));
    expect(onStart).toHaveBeenCalled();
  });
});
