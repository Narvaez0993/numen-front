/**
 * HU-25: Home leads with what the user said they came for.
 *
 * The server picks the face (`focus`); the hero only dresses it in the design's
 * shape. What this pins is that each face says its own thing. The bug it guards
 * was the hero answering every objective with the month's spend — so a saver
 * opened the app and read a spending screen.
 */

import { render, screen } from '@testing-library/react-native';

import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { HomeHero, type HeroFace } from '../HomeHero';

beforeAll(async () => {
  await i18n.changeLanguage('es');
  useCurrencyStore.setState({ currency: 'COP' });
});

function renderFace(face: HeroFace) {
  return render(
    <ThemeProvider>
      <HomeHero face={face} />
    </ThemeProvider>,
  );
}

describe('HomeHero', () => {
  it('leads with the goal when the objective is saving', () => {
    renderFace({
      kind: 'goal',
      goal: {
        name: 'Viaje a Cartagena',
        target: 3_000_000,
        saved: 600_000,
        pct: 0.2,
        projectedOn: null,
      },
      onPress: jest.fn(),
    });

    expect(screen.getByText(/de Viaje a Cartagena\./)).toBeTruthy();
    expect(screen.getByText('20%')).toBeTruthy();
    expect(screen.getByText('Ahorrado')).toBeTruthy();
    expect(screen.getByText('Tus metas')).toBeTruthy();
    expect(screen.getByText('600.000')).toBeTruthy();
    expect(screen.getByText('de $3.000.000')).toBeTruthy();
    expect(screen.queryByText('Gastado')).toBeNull();
  });

  it('says a reached goal is complete instead of «100%»', () => {
    renderFace({
      kind: 'goal',
      goal: { name: 'Bici', target: 900_000, saved: 900_000, pct: 1, projectedOn: null },
      onPress: jest.fn(),
    });

    expect(screen.getByText(/ya está completa\./)).toBeTruthy();
  });

  it('leads with the debt when the objective is paying it off', () => {
    renderFace({
      kind: 'debt',
      cardDebt: 1_200_000,
      cardLimit: 5_000_000,
      cardsCount: 1,
      iOwe: 0,
      owedToMe: 260_000,
      onPeoplePress: jest.fn(),
      onCardsPress: jest.fn(),
    });

    expect(screen.getByText('24%')).toBeTruthy();
    expect(screen.getByText('Debes')).toBeTruthy();
    // A card's debt lives with the accounts, not in Deudas.
    expect(screen.getByText('Tus tarjetas')).toBeTruthy();
    expect(screen.getByText('1.200.000')).toBeTruthy();
    // Money owed to the user is its own line, never added to the debt.
    expect(screen.getByText('Y a ti te deben $260.000')).toBeTruthy();
  });

  it('sends people debts to Deudas and adds them to the figure', () => {
    renderFace({
      kind: 'debt',
      cardDebt: 1_200_000,
      cardLimit: 5_000_000,
      cardsCount: 1,
      iOwe: 200_000,
      owedToMe: 0,
      onPeoplePress: jest.fn(),
      onCardsPress: jest.fn(),
    });

    expect(screen.getByText('tarjetas y personas')).toBeTruthy();
    expect(screen.getByText('Deudas')).toBeTruthy();
    expect(screen.getByText('1.400.000')).toBeTruthy();
  });

  it('keeps the design face for spending, with the Corte link', () => {
    renderFace({
      kind: 'spend',
      spent: 2_184_300,
      change: -0.12,
      corteMonth: 'septiembre',
      onCortePress: jest.fn(),
    });

    expect(screen.getByText('12% más liviana')).toBeTruthy();
    expect(screen.getByText('Gastado')).toBeTruthy();
    expect(screen.getByText('El Corte de septiembre')).toBeTruthy();
    expect(screen.getByText('2.184.300')).toBeTruthy();
  });

  it('draws no Corte link before the first Corte exists', () => {
    renderFace({
      kind: 'spend',
      spent: 50_000,
      change: null,
      corteMonth: null,
      onCortePress: jest.fn(),
    });

    expect(screen.queryByText(/El Corte de/)).toBeNull();
  });

  it('asks for the missing piece and still shows the month', () => {
    renderFace({
      kind: 'invite',
      objective: 'ahorrar',
      spent: 320_000,
      onPress: jest.fn(),
    });

    expect(screen.getByText('lo que estás ahorrando')).toBeTruthy();
    expect(screen.getByText('Crear mi primera meta')).toBeTruthy();
    expect(screen.getByText('320.000')).toBeTruthy();
  });

  it('puts the minus before the symbol when the month kept nothing', () => {
    renderFace({
      kind: 'saved',
      saved: -150_000,
      savingsRate: 0,
      onNewGoal: jest.fn(),
    });

    expect(screen.getByText('gastaste más')).toBeTruthy();
    expect(screen.getByText('−$')).toBeTruthy();
    expect(screen.getByText('150.000')).toBeTruthy();
  });
});
