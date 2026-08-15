import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  ChooseSheet,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { OverpaidError } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';
import { useAddDebtPayment } from '../../hooks/useDebtMutations';

type Props = {
  visible: boolean;
  debtId: string | null;
  /** Pre-filled by the chips in the detail sheet — "Todo" is the whole balance. */
  initialAmount?: number;
  currency: CurrencyCode;
  onClose: () => void;
  onSaved: (amount: number) => void;
};

/**
 * A repayment, in the `CREAR` grammar: the amount at the top, the account as a
 * row, the pad at the bottom.
 *
 * **The account is required, and that is why this sheet still exists.** The
 * design draws repayment as three chips and nothing else, which would be right
 * if a repayment were only a number — but it moves real cash, into an account
 * when they pay you and out of one when you pay them. Guessing which is a silent
 * lie about where the money is. So the chips set the amount and hand over here,
 * where the one thing they cannot answer gets asked.
 *
 * Anything above what is owed comes back as `debts.overpaid` from the server;
 * the sheet says so in place rather than closing on an error.
 */
export function RegistrarAbonoSheet({
  visible,
  debtId,
  initialAmount,
  currency,
  onClose,
  onSaved,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { today, debtById, counterpartyById } = useDebtsContext();
  const accounts = useAccounts();
  const addPayment = useAddDebtPayment(today);

  const [digits, setDigits] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const deuda = debtId ? debtById[debtId] : undefined;
  const person = deuda ? counterpartyById[deuda.counterpartyId] : undefined;

  const options = useMemo(
    () =>
      (accounts.data?.accounts ?? []).map((account) => ({
        value: account.id,
        label: account.name,
      })),
    [accounts.data],
  );

  useEffect(() => {
    if (!visible) return;
    setDigits(
      initialAmount !== undefined && initialAmount > 0 ? String(initialAmount) : '',
    );
    setFailed(null);
    setPickerOpen(false);
  }, [visible, debtId, initialAmount]);

  // Keep a valid account selected while the catalog loads.
  useEffect(() => {
    if (accountId === null && options.length > 0) setAccountId(options[0]?.value ?? null);
  }, [accountId, options]);

  if (!deuda || !person) return null;

  const amount = Number(digits || '0');
  const isIncoming = deuda.direction === 'incoming';
  const overpaid = amount > deuda.remaining;
  const valid = amount > 0 && !overpaid && accountId !== null;

  const handleSave = () => {
    if (!valid || accountId === null || addPayment.isPending) return;
    setFailed(null);
    addPayment.mutate(
      { id: deuda.id, amount, accountId },
      {
        onSuccess: () => {
          onSaved(amount);
          onClose();
        },
        onError: (error) =>
          setFailed(
            error instanceof OverpaidError
              ? t('deudas.abono.overpaid')
              : t('common.error'),
          ),
      },
    );
  };

  const help = failed ?? (overpaid ? t('deudas.abono.overpaid') : undefined);

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={digits}
      onDigits={setDigits}
      currency={currency}
      label={t(isIncoming ? 'deudas.abono.subIncoming' : 'deudas.abono.subOutgoing', {
        name: person.name,
      })}
      help={help}
      amountColor={help !== undefined ? theme.colors.accentCoral : undefined}
      primaryLabel={t('deudas.abono.save')}
      primaryDisabled={!valid || addPayment.isPending}
      onPrimary={handleSave}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('deudas.abono.title')}
          </Text>
        </>
      }
      overlays={
        <ChooseSheet
          visible={pickerOpen}
          title={t(isIncoming ? 'deudas.abono.accountIn' : 'deudas.abono.accountOut')}
          options={options}
          value={accountId}
          onChange={setAccountId}
          onClose={() => setPickerOpen(false)}
        />
      }
    >
      <SheetFieldRow
        label={t(isIncoming ? 'deudas.abono.accountIn' : 'deudas.abono.accountOut')}
        value={
          options.find((option) => option.value === accountId)?.label ??
          t('deudas.abono.noAccount')
        }
        chevron
        onPress={() => setPickerOpen(true)}
      />
    </AmountSheet>
  );
}
