/**
 * The welcome's demo: a phrase arrives word by word, becomes the movement it
 * records, and gives way to the next example.
 *
 * Pinned with a fake clock, because the timing IS the feature: words that all
 * land at once read as a caption, not as the app listening.
 */

import { act, render, screen } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';

import { i18n } from '@/shared/infrastructure/i18n';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { tokenize, WelcomeDemo } from '../WelcomeDemo';

function Harness({ start, still = false }: { start: boolean; still?: boolean }) {
  const talk = useSharedValue(0);
  const burst = useSharedValue(1);
  return <WelcomeDemo start={start} talk={talk} burst={burst} still={still} />;
}

function renderDemo(props: { start: boolean; still?: boolean }) {
  return render(
    <ThemeProvider>
      <Harness {...props} />
    </ThemeProvider>,
  );
}

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

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('tokenize', () => {
  it('keeps the part between asterisks as one bold token', () => {
    expect(tokenize('almuerzo de *18 mil* con Nequi')).toEqual([
      { text: 'almuerzo', bold: false },
      { text: 'de', bold: false },
      { text: '18 mil', bold: true },
      { text: 'con', bold: false },
      { text: 'Nequi', bold: false },
    ]);
  });
});

describe('WelcomeDemo', () => {
  it('waits for the greeting before it starts', () => {
    renderDemo({ start: false });
    advance(5000);
    expect(screen.queryByText('almuerzo')).toBeNull();
  });

  it('hears the phrase word by word, then shows what it recorded', () => {
    renderDemo({ start: true });

    expect(screen.getByText('Te escucho')).toBeTruthy();
    expect(screen.queryByText('almuerzo')).toBeNull();

    advance(380);
    expect(screen.getByText('almuerzo')).toBeTruthy();
    expect(screen.queryByText('Nequi')).toBeNull();

    advance(300 * 4);
    expect(screen.getByText('18 mil')).toBeTruthy();
    expect(screen.getByText('Nequi')).toBeTruthy();
    // Still listening: the card waits for the beat after the last word.
    expect(screen.queryByText('Almuerzo')).toBeNull();

    advance(620);
    expect(screen.getByText('Listo · ya quedó')).toBeTruthy();
    expect(screen.getByText('Almuerzo')).toBeTruthy();
    expect(screen.getByText('−$18.000')).toBeTruthy();
    expect(screen.getByText('Comida fuera')).toBeTruthy();
  });

  it('moves on to the next example, and loops', () => {
    renderDemo({ start: true });

    // First example through to its card, then the hold and the fade.
    advance(380 + 300 * 4 + 620 + 2400 + 360);
    expect(screen.queryByText('Almuerzo')).toBeNull();
    expect(screen.getByText('Te escucho')).toBeTruthy();

    advance(380 + 300 * 3 + 620);
    expect(screen.getByText('nómina')).toBeTruthy();
    expect(screen.getByText('+$2.950.000')).toBeTruthy();
  });

  it('with Reduce Motion, shows the first example already saved', () => {
    renderDemo({ start: false, still: true });

    expect(screen.getByText('Listo · ya quedó')).toBeTruthy();
    expect(screen.getByText('18 mil')).toBeTruthy();
    expect(screen.getByText('Almuerzo')).toBeTruthy();

    advance(10000);
    expect(screen.getByText('Almuerzo')).toBeTruthy();
  });
});
