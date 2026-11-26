/**
 * HU-07 «Eliminación de una fuente con movimientos»: before the second tap
 * deletes it, the sheet says how many movements the account or card has and
 * what will happen to them — they stay in the history and keep counting in the
 * month; only the source's balance (or the card's debt) leaves the net balance.
 * With no movements, deleting asks exactly as it always did.
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { SourceMovementCount } from '@/modules/movements/application';
import { i18n } from '@/shared/infrastructure/i18n';
import { ThemeProvider } from '@/shared/presentation/theme/ThemeProvider';

import type { Account, CreditCard } from '../../../domain';
import { AccountFormSheet } from '../AccountFormSheet';
import { CardFormSheet } from '../CardFormSheet';

const NOMINA: Account = {
  id: 'acc-nomina',
  kind: 'debit',
  name: 'Nómina',
  sub: '',
  icon: 'building-bank',
  color: 'purple',
  currency: 'COP',
  balance: 1_200_000,
};

const VISA: CreditCard = {
  id: 'card-visa',
  name: 'Visa',
  icon: 'credit-card',
  color: 'coral',
  currency: 'COP',
  cutoffDay: 25,
  dueDay: 5,
  debt: 850_000,
  limit: 5_000_000,
};

const counted = (count: number, more = false): SourceMovementCount => ({
  checking: false,
  count,
  more,
  failed: false,
});

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

function wrap(children: React.ReactNode) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

function mountAccount(deleteCheck: SourceMovementCount) {
  const onDelete = jest.fn();
  const onAskDelete = jest.fn();
  render(
    wrap(
      <AccountFormSheet
        visible
        account={NOMINA}
        currency="COP"
        onClose={jest.fn()}
        onSave={jest.fn()}
        onDelete={onDelete}
        onAskDelete={onAskDelete}
        deleteCheck={deleteCheck}
      />,
    ),
  );
  return { onDelete, onAskDelete };
}

describe('HU-07 · Eliminación de una fuente con movimientos', () => {
  it('warns how many movements the account has and what happens to them', () => {
    const { onDelete, onAskDelete } = mountAccount(counted(12));

    fireEvent.press(screen.getByText('Eliminar'));

    expect(onAskDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        '«Nómina» tiene 12 movimientos. Si la eliminas, se quedan en tu historial sin ' +
          'cuenta y siguen contando en los gastos e ingresos del mes, pero su saldo ' +
          'deja de sumar en tu saldo neto.',
      ),
    ).toBeTruthy();

    // Only the second tap deletes, once the warning has been read.
    fireEvent.press(screen.getByText('Sí, eliminar'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('says «más de 200» past the count it asks for', () => {
    mountAccount(counted(200, true));

    fireEvent.press(screen.getByText('Eliminar'));

    expect(screen.getByText(/^«Nómina» tiene más de 200 movimientos\./)).toBeTruthy();
  });

  it('holds the confirmation while the movements are still being counted', () => {
    const { onDelete } = mountAccount({
      checking: true,
      count: 0,
      more: false,
      failed: false,
    });

    fireEvent.press(screen.getByText('Eliminar'));
    expect(screen.getByText('Revisando sus movimientos…')).toBeTruthy();

    fireEvent.press(screen.getByText('Sí, eliminar'));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('still warns when the movements could not be counted', () => {
    mountAccount({ checking: false, count: 0, more: false, failed: true });

    fireEvent.press(screen.getByText('Eliminar'));

    expect(screen.getByText(/^No pudimos revisar sus movimientos\./)).toBeTruthy();
  });

  it('asks as before when the account has no movements', () => {
    const { onDelete } = mountAccount(counted(0));

    fireEvent.press(screen.getByText('Eliminar'));

    expect(screen.queryByText(/tiene \d+ movimiento|sin cuenta/)).toBeNull();
    // The usual line under the balance is still there.
    expect(screen.getByText(/^Lo que tienes ahí hoy\./)).toBeTruthy();
    fireEvent.press(screen.getByText('Sí, eliminar'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('warns about a card in terms of its debt', () => {
    const onDelete = jest.fn();
    render(
      wrap(
        <CardFormSheet
          visible
          card={VISA}
          currency="COP"
          onClose={jest.fn()}
          onSave={jest.fn()}
          onDelete={onDelete}
          deleteCheck={counted(1)}
        />,
      ),
    );

    fireEvent.press(screen.getByText('Eliminar'));

    expect(
      screen.getByText(
        '«Visa» tiene 1 movimiento. Si la eliminas, se queda en tu historial sin ' +
          'tarjeta y, si es un gasto, sigue contando en el mes, pero su deuda deja de ' +
          'restar en tu saldo neto.',
      ),
    ).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
