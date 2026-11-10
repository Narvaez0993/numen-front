/**
 * The manual form's two alternative flows.
 *
 * HU-13 «Monto inválido»: an amount of zero is refused when the user tries to
 * save it, and the amount itself is marked — the save button used to stay grey
 * and never say why. HU-14 «La categoría de ingreso es opcional»: an income can
 * leave without a category, where the form used to pick «Salario» for it.
 */

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/shared/infrastructure/i18n';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import { ManualSheet, type ManualPrefill } from '../ManualSheet';

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
          balance: 1_200_000,
        },
      ],
      creditCards: [],
    },
  }),
}));

jest.mock('@/modules/categories/presentation/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      {
        id: 'transporte',
        name: 'Transporte',
        icon: 'car',
        color: 'purple',
        flow: 'expense',
        isStandard: true,
      },
      {
        id: 'salario',
        name: 'Salario',
        icon: 'cash',
        color: 'mint',
        flow: 'income',
        isStandard: true,
      },
    ],
  }),
}));

beforeAll(async () => {
  await i18n.changeLanguage('es');
  useCurrencyStore.setState({ currency: 'COP' });
});

type Options = {
  type?: 'expense' | 'income';
  values?: ManualPrefill;
  rejectedField?: 'amount' | null;
};

function mount({ type = 'expense', values, rejectedField = null }: Options = {}) {
  const onSave = jest.fn();
  const ui = (field: 'amount' | null) => (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <ManualSheet
          visible
          initialType={type}
          initialValues={values}
          onSave={onSave}
          onSpeak={jest.fn()}
          onClose={jest.fn()}
          rejectedField={field}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
  const view = render(ui(rejectedField));
  return { onSave, reject: (field: 'amount') => view.rerender(ui(field)) };
}

/** The amount on top is the first «0» on screen; the keypad's comes after it. */
const amountColor = () =>
  StyleSheet.flatten(screen.getAllByText('0')[0]!.props.style).color as string;

describe('HU-13 · Monto inválido', () => {
  it('refuses to save a zero amount and marks the amount field', () => {
    const { onSave } = mount({ values: { description: 'Taxi al trabajo' } });
    const before = amountColor();

    fireEvent.press(screen.getByText('Guardar gasto'));

    expect(onSave).not.toHaveBeenCalled();
    const message = screen.getByText('Escribe un monto mayor que cero.');
    // The number itself turns the colour of the message under it.
    const coral = StyleSheet.flatten(message.props.style).color;
    expect(amountColor()).toBe(coral);
    expect(amountColor()).not.toBe(before);
  });

  it('clears the mark once an amount is typed, and then saves it', () => {
    const { onSave } = mount({ values: { description: 'Taxi al trabajo' } });
    fireEvent.press(screen.getByText('Guardar gasto'));

    fireEvent.press(screen.getByLabelText('5'));
    fireEvent.press(screen.getByLabelText('000'));

    expect(screen.queryByText('Escribe un monto mayor que cero.')).toBeNull();
    fireEvent.press(screen.getByText('Guardar gasto'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        amount: 5000,
        categoryId: 'transporte',
      }),
    );
  });

  it('marks the amount when the API refuses it', () => {
    const { reject } = mount({ values: { description: 'Taxi', amount: 5000 } });
    expect(screen.queryByText('Escribe un monto mayor que cero.')).toBeNull();

    act(() => reject('amount'));

    expect(screen.getByText('Escribe un monto mayor que cero.')).toBeTruthy();
  });
});

describe('HU-14 · La categoría de ingreso es opcional', () => {
  it('opens an income without a category and saves it that way', () => {
    const { onSave } = mount({
      type: 'income',
      values: { description: 'Reembolso', amount: 80_000 },
    });

    // The row says so instead of guessing «Salario».
    expect(screen.getByText('Sin categoría')).toBeTruthy();
    fireEvent.press(screen.getByText('Guardar ingreso'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'income', amount: 80_000, categoryId: null }),
    );
  });

  it('offers «Sin categoría» in the picker to undo a chosen one', () => {
    const { onSave } = mount({
      type: 'income',
      values: { description: 'Quincena', amount: 1_500_000, categoryId: 'salario' },
    });
    expect(screen.getByText('Salario')).toBeTruthy();

    fireEvent.press(screen.getByText('Categoría'));
    // The picker's own «Sin categoría» row, above «Salario».
    const options = screen.getAllByText('Sin categoría');
    fireEvent.press(options[options.length - 1]!);
    fireEvent.press(screen.getByText('Guardar ingreso'));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ categoryId: null }));
  });

  it('keeps preselecting a category for an expense', () => {
    mount({ values: { description: 'Bus', amount: 3_000 } });
    expect(screen.getByText('Transporte')).toBeTruthy();
    expect(screen.queryByText('Sin categoría')).toBeNull();
  });
});
