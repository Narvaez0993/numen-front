import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  monthLabel: string;
  /** Net for the month: income against expenses, transfers excluded. */
  monthTotal: number;
  currency: CurrencyCode;
};

/**
 * The month, and what it came to.
 *
 * The screen's name shrinks to a label and the MONTH becomes the title, because
 * that is what the user changes and what everything below belongs to — "Movimientos"
 * never varies and does not deserve the largest type on the page.
 *
 * The net is signed and coloured only when it is positive. A month that took in
 * more than it spent is news; the ordinary case is not, and painting it red every
 * month would make the ordinary look like a problem.
 */
export function MovementsHeader({ monthLabel, monthTotal, currency }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const positive = monthTotal > 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2, marginBottom: 7 }}
        >
          {t('movements.title')}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 29, fontWeight: '300', letterSpacing: -1 }}
        >
          {monthLabel}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 1.6, marginBottom: 5 }}
        >
          {t('movements.net')}
        </Text>
        <Text
          tabular
          color={positive ? theme.colors.accentMint : theme.colors.textPrimary}
          style={{ fontSize: 17, fontWeight: '500' }}
        >
          {positive ? '+' : ''}
          {formatMoney(monthTotal, currency)}
        </Text>
      </View>
    </View>
  );
}
