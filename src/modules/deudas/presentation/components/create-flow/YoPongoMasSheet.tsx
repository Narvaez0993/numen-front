import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CurrencyCode } from '@/shared/domain';
import { AmountSheet, SheetHeaderButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  visible: boolean;
  total: number;
  currency: CurrencyCode;
  personsCount: number;
  onClose: () => void;
  onApply: (mine: number) => void;
};

/**
 * "Yo pongo más" — you type your own share, and the rest divides itself.
 *
 * It is the one shortcut that cannot be a chip: the number is different every
 * time. What it gives back is the same arithmetic the split step does, run
 * backwards, so the line under the amount says what each of the others ends up
 * owing before you commit to it.
 */
export function YoPongoMasSheet({
  visible,
  total,
  currency,
  personsCount,
  onClose,
  onApply,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');

  useEffect(() => {
    if (visible) setDigits('');
  }, [visible]);

  const mine = Number(digits || '0');
  const valid = mine > 0 && mine <= total;
  const perOther =
    personsCount > 0 ? Math.floor((total - mine) / personsCount / 100) * 100 : 0;

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={digits}
      onDigits={setDigits}
      currency={currency}
      label={t('deudas.create.yoPongoMas.title')}
      help={
        valid
          ? t('deudas.create.yoPongoMas.perOther', {
              count: personsCount,
              amount: formatMoney(perOther, currency),
            })
          : t('deudas.create.yoPongoMas.subtitle', { count: personsCount })
      }
      amountColor={mine > total ? theme.colors.accentCoral : undefined}
      primaryLabel={t('deudas.create.yoPongoMas.apply')}
      primaryDisabled={!valid}
      onPrimary={() => valid && onApply(mine)}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('deudas.create.iPayMore')}
          </Text>
        </>
      }
    />
  );
}
