/**
 * HU-29 «Tope superado»: 3.200.000 spent of a 3.000.000 ceiling is reported as
 * 200.000 over — never as «0 left», and with no daily figure to spend.
 */

import { render, screen } from '@testing-library/react-native';

import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { BudgetPulse } from '../BudgetPulse';

beforeAll(async () => {
  await i18n.changeLanguage('es');
  useCurrencyStore.setState({ currency: 'COP' });
});

describe('HU-29 · Tope superado', () => {
  it('reports the 200.000 over the ceiling, with no daily figure', () => {
    render(
      <ThemeProvider>
        <BudgetPulse
          budget={{
            target: 3_000_000,
            spent: 3_200_000,
            remaining: -200_000,
            used: 3_200_000 / 3_000_000,
            perDay: null,
            projected: null,
            over: 200_000,
          }}
          daysLeft={10}
          elapsed={0.67}
          onPress={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Te pasaste')).toBeTruthy();
    expect(screen.getByText('200.000')).toBeTruthy();
    expect(screen.queryByText('Te queda')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.queryByText(/por día/)).toBeNull();
  });
});
