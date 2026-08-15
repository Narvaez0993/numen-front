import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { amountDigits } from '@/shared/presentation/utils/formatMoney';

import type { DebtDirection } from '../../domain';
import { debtTone } from '../utils/debtTone';

type Props = {
  direction: DebtDirection;
  total: number;
  count: number;
  currency: CurrencyCode;
};

/**
 * One number, the size of the question.
 *
 * The screen used to open with both totals side by side at 12.5px, which is the
 * layout of a summary and not of an answer — you had to read two figures to find
 * out which one you had come for. The tab already says which side you are on, so
 * the total follows it and gets the whole line.
 *
 * The `$` stays small and light: it is punctuation, and at 43px it would compete
 * with the digits for the same glance.
 */
export function DebtHero({ direction, total, count, currency }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const tone = debtTone(theme, direction);

  return (
    <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
      <Text
        variant="micro"
        uppercase
        color={theme.colors.textTertiary}
        style={{ letterSpacing: 2.2, marginBottom: 9 }}
      >
        {t(`deudas.hero.${direction}`)}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
        <Text
          color={theme.colors.textTertiary}
          style={{ fontSize: 19, fontWeight: '300' }}
        >
          $
        </Text>
        <Text
          tabular
          color={tone}
          style={{
            fontSize: 43,
            fontWeight: '500',
            letterSpacing: -2.1,
            lineHeight: 41,
          }}
        >
          {amountDigits(total, currency)}
        </Text>
      </View>

      <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5, marginTop: 10 }}>
        {t(`deudas.hero.foot.${direction}`, { count })}
      </Text>
    </View>
  );
}
