import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  SheetDangerAction,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';

type Props = {
  visible: boolean;
  /** `null` when no ceiling has ever been set. */
  current: number | null;
  monthName: string;
  currency: CurrencyCode;
  saving?: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  onDelete?: () => void;
};

/**
 * The month's ceiling — the same `CREAR` sheet as a cap, because it is the same
 * act: naming a number that money is measured against.
 *
 * The help line says the thing people get wrong about it. A ceiling is standing,
 * not monthly: it keeps applying to September and October until it is changed,
 * so nobody has to remember to set it again. That is one sentence, and without
 * it the screen looks like it is asking for August only.
 *
 * No microphone. You can dictate what you spent, because it already happened;
 * a ceiling is a decision, and decisions are typed.
 */
export function CeilingSheet({
  visible,
  current,
  monthName,
  currency,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const [digits, setDigits] = useState(current !== null ? String(current) : '');

  useEffect(() => {
    if (visible) setDigits(current !== null ? String(current) : '');
  }, [visible, current]);

  const amount = Number(digits || '0');

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={digits}
      onDigits={setDigits}
      currency={currency}
      label={t('budgets.hero.ceiling')}
      help={t('budgets.editTecho.helper', { month: monthName })}
      primaryLabel={t('budgets.editTecho.save')}
      onPrimary={() => onSave(amount)}
      primaryDisabled={saving || amount <= 0}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('budgets.editTecho.title', { month: monthName })}
          </Text>
          {current !== null && onDelete ? (
            <SheetDangerAction
              label={t('expenses.correct.remove')}
              onConfirm={onDelete}
            />
          ) : null}
        </>
      }
    />
  );
}
